const Path = require('path')
const tar = require("tar-stream");

const {base, Node} = require('@kba/vfs')
const {
    UnsupportedFormatError,
    PathNotAbsoluteError,
    NoSuchFileError,
} = require('@kba/vfs-errors')
const {hasDecompressor, getDecompressor} = require('@kba/vfs-util-compression')
const {createReadableWrapper} = require('@kba/vfs-util-stream')

/** 
 * A VFS over tarballs
 * @implements api
 * @implements base
 * @alias tar
 */
class tarvfs extends base {

    static get scheme() { return 'tar' }

    constructor(options) {
        if (!options.location)
            throw new Error("Must set 'location'")
        if (!(options.location instanceof Node))
            throw new Error("'location' must be a vfs.Node")
        if (options.compression && !hasDecompressor(options.compression))
            throw UnsupportedFormatError(options.compression)
        super(options)
        this._files = new Map()
    }

    _tarEntryToVfsNode(entry) {
        const node = {}
        node.vfs = this
        node.path = entry.name.substr(1).replace(/\/$/, '') || '/'
        node.isDirectory = entry.type == 'directory'
        // TODO symlink fifo etc.
        ;['size', 'mtime', 'mode', 'uid', 'gid', 'uname', 'gname'].forEach(
            k => node[k] = entry[k])
        // console.log(node)
        return new Node(node)
    }

    // TODO handle compression
    _extract(handlers) {
        const location = this.options.location
        var inStream = location.vfs.createReadStream(location.path)
        const extract = tar.extract()
        Object.keys(handlers).forEach(event => {
            extract.on(event, handlers[event])
        })
        if (this.options.compression !== undefined) {
            inStream.pipe(getDecompressor(this.options.compression)).pipe(extract)
        } else {
            inStream.pipe(extract)
        }
    }

    _sync() {
        this._extract({
            entry: (header, stream, next) => {
                const node = this._tarEntryToVfsNode(header)
                this._files.set(node.path, node)
                stream.on('end', next)
                stream.resume() // just auto drain the stream 
            },
            finish: () => {
                this.emit('sync')
            }
        })
    }

    _createReadStream(path, options) {
        if (!Path.isAbsolute(path)) throw PathNotAbsoluteError(path)
        if (!this._files.has(path)) throw NoSuchFileError(path)
        const wrapper = createReadableWrapper()
        this._extract({
            entry: (header, stream, next) => {
                if (header.name.substr(1) === path) {
                    wrapper.wrapStream(stream)
                    next()
                } else {
                    stream.on('end', next)
                    stream.resume() // just auto drain the stream 
                }
            }
        })
        return wrapper
    }

    _stat(path, options, cb) {
        if (!(Path.isAbsolute(path))) return cb(PathNotAbsoluteError(path))
        if (!this._files.has(path)) return cb(NoSuchFileError(path))
        return cb(null, this._files.get(path))
    }

    _readdir(path, options, cb) {
        if (!(Path.isAbsolute(path))) return cb(PathNotAbsoluteError(path))
        return cb(null, Array.from(this._files.keys())
            .filter(filePath => filePath.indexOf(path) === 0)
            .map(filePath => filePath.replace(path, '').replace(/^\//, ''))
            .filter(filePath => filePath !== '' && filePath.indexOf('/') === -1))
    }

}
module.exports = tarvfs
