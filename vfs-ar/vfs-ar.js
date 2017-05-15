const Readable = require('stream').Readable;
const Path = require('path')
const ar = require("ar-async");
const {getDecompressor} = require('@kba/vfs-util-compression')

const {base, Node} = require('@kba/vfs')
const errors = require('@kba/vfs-util-errors')

/** 
 * A VFS over UNIX archives, e.g. Debian packages
 * @implements api
 * @implements base
 * @alias tar
 */
class arvfs extends base {

    static get scheme() { return 'ar' }
    static get supportedCompression() { return new Set(['xz']) }

    constructor(options) {
        if (!options.location)
            throw new Error("Must set 'location'")
        if (!(options.location instanceof Node))
            throw new Error("'location' must be a vfs.Node")
        if (options.compression && !arvfs.supportedCompression.has(options.compression))
            throw new Error(`Compression not supported: ${options.compression}`)
        super(options)
        this._files = new Map()
    }

    _tarEntryToVfsNode(entry) {
        const node = {}
        node.vfs = this
        node.path = entry.name.substr(1).replace(/\/$/, '') || '/'
        node.isDirectory = entry.type == 'directory'
        ;['size', 'mtime', 'mode', 'uid', 'gid', 'uname', 'gname'].forEach(
            k => node[k] = entry[k])
        // console.log(node)
        return new Node(node)
    }

    // TODO handle compression
    _extract(handlers) {
        const location = this.options.location
        var inStream = location.vfs.createReadStream(location.path)
        const extract = ar.extract()
        Object.keys(handlers).forEach(event => {
            extract.on(event, handlers[event])
        })
        if (this.options.compression !== undefined) {
            const decompress = getDecompressor(this.options.compression)()
            inStream.pipe(decompress).pipe(extract)
        } else {
            inStream.pipe(extract)
        }
    }

    _sync() {
        this._extract({
            entry: (header, stream, next) => {
                const node = this._tarEntryToVfsNode(header)
                this._files.set(node.path, node)
                console.log("FILES", this._files)
                stream.on('end', next)
                stream.resume() // just auto drain the stream 
            },
            finish: () => {
                // all entries read 
                // console.log(this._files)
                // this.emit('sync')
            }
        })
    }

    _createReadStream(path, options) {
        if (!Path.isAbsolute(path)) throw errors.PathNotAbsoluteError(path)
        if (!this._files.has(path)) throw errors.NoSuchFileError(path)
        const ret = new Readable({
            read(...args) {
                if (this._wrapped) this._wrapped.read(...args)
            }
        })
        this._extract({
            entry: (header, stream, next) => {
                if (header.name.substr(1) === path) {
                    ret._wrapped = stream
                    ;['close', 'data', 'end', 'error'].forEach(event => {
                        stream.on(event, (...args) => ret.emit(event, ...args))
                    })
                    ret.emit('readable')
                    next()
                } else {
                    stream.on('end', next)
                    stream.resume() // just auto drain the stream 
                }
            }
        })
        return ret
    }

    _stat(path, options, cb) {
        if (!(Path.isAbsolute(path))) return cb(errors.PathNotAbsoluteError(path))
        if (!this._files.has(path)) return cb(errors.NoSuchFileError(path))
        return cb(null, this._files.get(path))
    }

    _readdir(path, cb) {
        if (!(Path.isAbsolute(path))) return cb(errors.PathNotAbsoluteError(path))
        return cb(null, Array.from(this._files.keys())
            .filter(filePath => filePath.indexOf(path) === 0)
            .map(filePath => filePath.replace(path, '').replace(/^\//, ''))
            .filter(filePath => filePath !== '' && filePath.indexOf('/') === -1))
    }

}
module.exports = arvfs
