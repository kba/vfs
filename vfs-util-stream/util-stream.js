const Readable = require('stream').Readable
/**
 * ### StreamUtils
 *
 * #### `(static) createReadableWrapper()`
 *
 * Wraps another ReadableStream to allow synchronously returning a stream
 * that will become readable only later.
 *
 * ```js
 * const {createReadableWrapper} = require('@kba/vfs-util-stream')
 * const readable = createReadableWrapper()
 * // TODO, see vfs-tar
 * ```
 *
 */
function createReadableWrapper() {
    const ret = new Readable({
        read(...args) {
            if (this._wrapped) this._wrapped.read(...args)
        }
    })
    /**
     * #### `ReadableWrapper`
     *
     * TODO
     *
     * ##### `wrapStream(stream)`
     *
     * TODO
     */
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
    createReadableWrapper,
}
