const Readable = require('stream').Readable;
const {UnsupportedFormatError} = require('@kba/vfs-errors')

const decompress = {
    gzip: require('zlib').createGunzip,
    bzip2: require('unbzip2-stream'),
    xz: () => new(require('xz').Decompressor)(),
}

/**
 * @class util
 */

/**
 * Whether a decompression format is supported
 * @memberof util
 */
function hasDecompressor(format) { return format in decompress }

/**
 * Instantiate a decompression stream
 * @memberof util
 */
function getDecompressor(format, ...args) {
    if (!(hasDecompressor(format))) throw UnsupportedFormatError(format)
    return decompress[format](...args)
}
/**
 * Wraps another ReadableStream to allow synchronously returning a stream
 * that will become readable only later.
 *
 * @memberof util
 * @static
 */
function createReadableWrapper() {
    const ret = new Readable({
        read(...args) {
            if (this._wrapped) this._wrapped.read(...args)
        }
    })
    ret.wrapStream = (stream) => {
        ret._wrapped = stream
        ;['close', 'data', 'end', 'error'].forEach(event => {
            stream.on(event, (...args) => ret.emit(event, ...args))
        })
        ret.emit('readable')
    }
    return ret
}

module.exports = { 
    hasDecompressor,
    getDecompressor,
    createReadableWrapper,
}
