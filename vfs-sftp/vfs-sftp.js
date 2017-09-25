const Path = require('path')
const PathUtils = require('@kba/vfs-util-path')
const sftpClient = require('ssh2-sftp-client')

const {base, Node} = require('@kba/vfs')
const errors = require('@kba/vfs-util-errors')
const {createReadableWrapper} = require('@kba/vfs-util-stream')

/** 
 * A VFS over SFTP connection
 * @implements api
 * @implements base
 * @alias sftp
 */
class sftpvfs extends base {

    static get scheme() { return 'sftp' }

    constructor(options={}) {
        if (!options.sshOptions) throw new Error("Must set 'sshOptions'")
        super(options)
    }

    _sync() {
        const sftp = new sftpClient()
        sftp.connect(this.options.sshOptions)
            .then(() => {
                this.sftp = sftp
                this.emit('sync')
            })
            .catch(err => {
                this.emit('error', err)
            })
    }

    _end() {
        this.sftp.client.end()
        this.emit('end')
    }

    _sftpEntryToNode(path, e) {
        const _attr = {path}
        _attr.vfs = this
        if (e.type === 'd') {
            _attr.isDirectory = true
        } else if (e.type === 'l') {
            _attr.isDirectory = false
            _attr.isSymbolicLink = true
        } else {
            _attr.isDirectory = false
            _attr.isSymbolicLink = false
        }
        _attr.mtime = new Date(e.modifyTime)
        // TODO permissions
        _attr.size = e.size
        // console.log(e)
        return new Node(_attr)
    }

    _stat(path, options, cb) {
        if (!(Path.isAbsolute(path))) return cb(errors.PathNotAbsoluteError(path))
        const abspath = PathUtils.chrootPath(path, this.options.chroot)
        const dirname = Path.dirname(abspath)
        const basename = Path.basename(abspath)
      // console.log('_stat', {abspath, dirname, basename})
        // XXX inefficient
        this.sftp.list(dirname)
            .then(list => {
                const e = list.find(e => e.name === basename)
                if (!e) return cb(errors.NoSuchFileError(path))
                return cb(null, this._sftpEntryToNode(path, e))
            })
            .catch(err => {
              console.warn(err)
              cb(err)
            })
    }

    _readdir(dir, options, cb) {
        if (!(Path.isAbsolute(dir))) return cb(errors.PathNotAbsoluteError(dir))
        dir = PathUtils.chrootPath(dir, this.options.chroot)
        dir = PathUtils.removeTrailingSep(dir)
      // console.log('_readdir', {dir})
        this.sftp.list(dir)
            .then(list => {
                const ret = list.map(e => e.name)
                return cb(null, ret)
            })
            .catch(err => cb(err))
    }

    _createReadStream(path, options={}) {
        if (!(Path.isAbsolute(path))) throw errors.PathNotAbsoluteError(path)
        const abspath = (this.options.chroot) ? Path.join(this.options.chroot, path) : path
        const wrapper = createReadableWrapper()
        this.sftp.get(
            abspath,
            this.options.sshOptions.useCompression,
            options.encoding
        ).then(stream => {
            wrapper.wrapStream(stream)
        }).catch(err => {
            throw err
        })
        return wrapper
    }

}
module.exports = sftpvfs

// vim: sw=4 ts=4
