const Path = require('path')
const mimeTypes = require('mime-types')

/**
 *
 * ### vfs.Node
 *
 * ```js
 * new fsvfs.Node({path: "/...", vfs: vfsInstance})
 * ```
 * 
 * Class representing file metadata
 * #### Constructor
 *
 * - `@param {object} options` Options that will be passed
 * - `@param {string} options.path` Absolute path to the node
 * - `@param {fsvfs} options.vfs` Instance of a {@link fsvfs}
 * 
 * #### Properties
 * ##### `vfs`
 * Parent vfs instance, e.g. a [file](./vfs-file)
 * ##### `path`
 * Absolute, normalized path of the node within the vfs
 * ##### `mtime`
 * Date of last modification
 * ##### `mode`
 * ##### `mimetype`
 * MIME type of this node
 * ##### `%root`
 * See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
 * ##### `%dir`
 * See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
 * ##### `%base`
 * See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
 * ##### `%ext`
 * See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
 * ##### `%name`
 * See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
 *
 */
class Node {
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
