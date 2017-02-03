const Readable = require('stream').Readable;

const decompress = {
    gzip: require('zlib').createGunzip,
    bzip2: require('unbzip2-stream'),
    xz: () => new(require('xz').Decompressor)(),
}

/**
 * Wraps another ReadableStream to allow synchronously returning a stream
 * that will become readable only later.
 *
 * @memberof vfs.util
 * @alias xar
 * @class
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
    decompress,
    createReadableWrapper,
}
