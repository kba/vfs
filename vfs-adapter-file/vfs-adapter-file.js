const fs = require('fs')
const Path = require('path')
const errors = require('@kba/vfs-util-errors')
const {base, Node} = require('@kba/vfs')

/** 
 * A VFS over the local filesystem.
 * @implements api
 * @implements base
 * @alias file
 */
class filevfs extends base {

    static get scheme() {return 'file'}

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

    _sync() {this.emit('sync')}

    _stat(path, opts, cb) {
        if (!cb && typeof opts == 'function') [cb, opts] = [opts, {}]
        path = this._resolvePath(path)
        fs.lstat(path, (err, stat) => {
            if (err) return cb(errors.NoSuchFileError(path))
            return cb(null, this._fsStatsToAttr(path, stat))
        })
    }

    _unlink(path, options, ...args)   {return fs.unlink(this._resolvePath(path), ...args)}
    _rmdir(path, options, ...args)    {return fs.rmdir(this._resolvePath(path), ...args)}
    _mkdir(path, ...args)             {return fs.mkdir(this._resolvePath(path), ...args)}
    _createReadStream(path, ...args)  {return fs.createReadStream(this._resolvePath(path), ...args)}
    _createWriteStream(path, ...args) {return fs.createWriteStream(this._resolvePath(path), ...args)}
    _readdir(path, ...args)           {return fs.readdir(this._resolvePath(path), ...args)}
    _readFile(path, ...args)          {return fs.readFile(this._resolvePath(path), ...args)}
    _writeFile(path, ...args)         {return fs.writeFile(this._resolvePath(path), ...args)}
}

module.exports = filevfs
