const Readable = require('stream').Readable;

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
