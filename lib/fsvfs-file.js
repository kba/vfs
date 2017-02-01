const fs = require('fs')
const Path = require('path')
const fsvfs = require('./fsvfs')

/** 
 * A VFS over the local filesystem.
 * @extends fsvfs
 * @alias file
 */
class vfsFile extends fsvfs {

    static get scheme() { return 'file' }

    _fsStatsToAttr(path, stats) {
        fsvfs.NODE_TYPES.forEach(type => stats[`is${type}`] = stats[`is${type}`]())
        stats.path = path
        stats.vfs = this
        return new fsvfs.Node(stats)
    }

    stat(path, opts, cb) {
        if (!cb && typeof opts == 'function') [cb, opts] = [opts, {}]
        path = Path.resolve(path)
        fs.lstat(path, (err, stat) => {
            if (err) return cb(err)
            return cb(null, this._fsStatsToAttr(path, stat))
        })
    }

    readdir(...args) { fs.readdir(...args) }
    readFile(...args) { fs.readFile(...args) }
    writeFile(...args) { fs.writeFile(...args) }
}
module.exports = vfsFile
