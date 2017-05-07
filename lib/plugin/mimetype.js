const mimeTypes = require('mime-types')

class MimetypePlugin {

    constructor(options={}) {
        this.options = options
    }

    before_stat(node, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return cb(null, node)
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
