/* eslint camelcase:0 */
const mimeTypes = require('mime-types')

class MimetypePlugin {

    constructor(options={}) {
        this.options = options
    }

    after_stat(node, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        node.mimetype = node.isDirectory
            ? 'inode/directory'
            : mimeTypes.lookup(node.path) || 'application/octet-stream'
        return cb(null, node)
    }

}
module.exports = MimetypePlugin
