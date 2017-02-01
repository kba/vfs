const Path = require('path')
const mimeTypes = require('mime-types')

/**
 * Class representing file metadatax
 *
 * Properties
 *   - vfs
 *   - mimetype
 *   - mtime
 *   - mode
 *
 * @memberof fsvfs
 * @example
 * new fsvfs.Node({path: "/...", vfs: vfsInstance})
 *
 */
class Node {

    // Properties

    /** 
     * MIME type of the node as determined by its path.
     * 
     * @name fsvfs.Node#mimetype
     * @type {string}
     */

    /** 
     * Date of last modification
     * 
     * @type {Date}
     * @name fsvfs.Node#mtime
     */

    /**
     * Create a {@link Node}.
     *
     * @param {object} options Options that will be passed
     * @param {string} options.path Absolute path to the node
     * @param {fsvfs} options.vfs Instance of a {@link fsvfs}
     */
    constructor(options) {
        if (!(options.path)) throw new Error("Must set 'path'")
        if (!Path.isAbsolute(options.path)) throw new Error(`'path' must be absolute: ${options.path}`)
        if (!(options.vfs)) throw new Error("Must set 'vfs'")
        Object.keys(options).forEach(k => this[k] = options[k])
        const pathParsed = Path.parse(options.path)
        for (let k in pathParsed) this['%' + k] = pathParsed[k]
        this.mimetype = this.isDirectory
            ? 'inode/directory'
            : mimeTypes.lookup(this.path) || 'application/octet-stream'
    }

}

module.exports = Node
