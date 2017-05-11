const fs = require('fs')
const Path = require('path')
const {base, Node} = require('@kba/vfs')

/** 
 * A VFS over the local filesystem.
 * @implements api
 * @implements base
 * @alias file
 */
class vfsFile extends base {

    static get scheme() { return 'file' }

    /**
     *
     * @param {object} options
     * @param {object} options.chroot A root path to restrict access of the vfs
     *                                to a certain area of the underlying fs
     */
    constructor(options={}) {
        options.chroot = (options.chroot || '')
        if (options.chroot !== '' && !Path.isAbsolute(options.chroot))
            throw new TypeError(`options.chroot must be absolute, '${options.chroot}' is not`)
        super(options)
    }

    _fsStatsToAttr(path, stats) {
        base.NODE_TYPES.forEach(type => stats[`is${type}`] = stats[`is${type}`]())
        stats.path = path.substr(this.options.chroot.length) || '/'
        stats.vfs = this
        return new Node(stats)
    }

    _resolvePath(path) {
        return Path.resolve(Path.join(this.options.chroot, path))
    }

    sync() { this.emit('sync') }

    _stat(path, opts, cb) {
        if (!cb && typeof opts == 'function') [cb, opts] = [opts, {}]
        path = this._resolvePath(path)
        fs.lstat(path, (err, stat) => {
            if (err) return cb(err)
            return cb(null, this._fsStatsToAttr(path, stat))
        })
    }

    unlink(path, ...args)            { return fs.unlink(this._resolvePath(path), ...args) }
    mkdir(path, ...args)             { return fs.mkdir(this._resolvePath(path), ...args) }
    createReadStream(path, ...args)  { return fs.createReadStream(this._resolvePath(path), ...args) }
    createWriteStream(path, ...args) { return fs.createWriteStream(this._resolvePath(path), ...args) }
    readdir(path, ...args)           { return fs.readdir(this._resolvePath(path), ...args) }
    readFile(path, ...args)          { return fs.readFile(this._resolvePath(path), ...args) }
    writeFile(path, ...args)         { return fs.writeFile(this._resolvePath(path), ...args) }
}

module.exports = vfsFile
