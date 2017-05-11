const async = require('async')
const fs = require('fs')
const Path = require('path')
const JSZip = require("jszip");
const {Readable} = require('stream')

const {base, errors, Node} = require('@kba/vfs')

/** 
 * A VFS over ZIP content
 * @implements api
 * @implements base
 * @alias zip
 */
class zipvfs extends base {

    static get scheme() { return 'zip' }

    constructor(options={}) {
        if (!options.location) throw new Error("Must set 'location'")
        if (!(options.location instanceof Node)) throw new Error("'location' must be a vfs.Node")
        super(options)
    }

    _zipEntryToVfsNode(entry) {
        const _attr = {}
        // log.debug("ZIP entry", entry)
        // log.debug("ZIP entry _data", entry.data)
        _attr.vfs = this
        _attr.path = '/' + entry.name
        if (entry.dir) {
            _attr.isDirectory = true
            _attr.size = 4096
            _attr.mode = 16832
        } else {
            _attr.isDirectory = false
            _attr.compressedSize = entry._data.compressedSize
            _attr.size = entry._data.uncompressedSize
            _attr.crc32 = entry.crc32
            _attr.mode = entry.unixPermissions
        }
        _attr.mtime = entry.date
        _attr.ctime = entry.date
        _attr.atime = entry.date
        return new Node(_attr)
    }

    sync() {
        const new_zip = new JSZip();
        const location = this.options.location
        location.vfs.readFile(location.path, (err, content) => {
            if (err) return this.emit('error', err)
            new_zip.loadAsync(content).then((zip) => {
                this.zipRoot = zip
                this.emit('sync')
            }).catch(err => this.emit('error', err))
        })
    }

    _stat(path, options, cb) {
        if (!(Path.isAbsolute(path))) return cb(errors.PathNotAbsoluteError(path))
        path = Path.normalize(path.substr(1))
        if (!(path in this.zipRoot.files)) path += '/'
        if (!(path in this.zipRoot.files)) return cb(errors.NoSuchFileError(path))
        const entry = (path.match(/\/$/))
            ? this.zipRoot.files[path]
            : this.zipRoot.file(path)
        // log.debug("ZIP entry", entry)
        return cb(null, this._zipEntryToVfsNode(entry))
    }

    readdir(dir, cb) {
        if (!(Path.isAbsolute(dir))) return cb(errors.PathNotAbsoluteError(dir))
        dir = this._removeTrailingSep(dir)
        var ret = Object.keys(this.zipRoot.files)
            .map(filename => this._removeTrailingSep('/' + filename))
            .filter(filename => filename !== dir && filename.indexOf(dir) === 0)
            .map(filename => filename.replace(dir + '/', ''))
            .filter(filename => ! filename.match('/'))
            // .map(filename => { console.log(filename); return filename })
        return cb(null, ret)
    }

    createReadStream(path, options={}) {
        if (!(Path.isAbsolute(path))) throw errors.PathNotAbsoluteError(path)
        const relpath = Path.normalize(path.substr(1))
        if (!(relpath in this.zipRoot.files)) throw errors.NoSuchFileError(path)
        var self = this
        var read = 0
        return new Readable({
            read(size) {
                if (read > 0) return
                self.readFile(path, options, (err, buf) => {
                    read = buf.length
                    this.push(buf)
                    this.push(null)
                })
            }
        })
    }

    readFile(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!(Path.isAbsolute(path))) return cb(errors.PathNotAbsoluteError(path))
        path = path.substr(1)
        const format = options.encoding ? 'string' : 'arraybuffer'
        this.zipRoot.file(path).async(format)
            .then(data => {
                cb(null, format === 'string' ? data : new Buffer(data))
            })
            .catch(cb)
    }

    writeFile(path, data, options, cb) {
        if (!(Path.isAbsolute(path))) return cb(errors.PathNotAbsoluteError(path))
        path = path.substr(1)
        if (typeof options === 'function') [cb, options] = [options, {}]
        this.zipRoot.file(path, data)
        // TODO how to catch errors since file is chainable??
        return cb(null)
    }

    unlink(path, cb) {
        this.stat(path, (err, file) => {
            if (err) return cb(null)
            if (file.isDirectory) return cb(new Error("Cannot unlink directory, use 'rmdir'"))
            this.zipRoot.remove(path.substr(1))
            return cb(null)
        })
    }

}
module.exports = zipvfs
