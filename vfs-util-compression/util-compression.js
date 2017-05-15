const {UnsupportedFormatError} = require('@kba/vfs-errors')

const decompress = {
    gzip: require('zlib').createGunzip,
    bzip2: require('unbzip2-stream'),
    xz: () => new(require('xz').Decompressor)(),
}

/**
 * ### CompressionUtils
 *
 */

/**
 * #### `(static) hasDecompressor(format)`
 * 
 * Whether a decompression format is supported
 */
function hasDecompressor(format) { return format in decompress }

/**
 * #### `(static) getDecompressor(format)`
 * 
 * Instantiate a decompression stream
 * @memberof util
 */
function getDecompressor(format, ...args) {
    if (!(hasDecompressor(format))) throw UnsupportedFormatError(format)
    return decompress[format](...args)
}

module.exports = { 
    hasDecompressor,
    getDecompressor,
}
