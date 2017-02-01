const async = require('async')
const {EventEmitter} = require('events')
const fsvfsNode = require('./node')
const Path = require('path')

const NODE_TYPES = [
    // 'File',
    'Directory',
    // 'BlockDevice',
    // 'CharacterDevice',
    'SymbolicLink',
    // 'FIFO',
    // 'Socket',
]


const _EVENT = Symbol('event')

/** Base class of all vfs */
class fsvfs {

    static get Node() { return fsvfsNode }

    /**
     * Types a {@link Node} can have.
     *
     * Currently:
     *  - Directory
     *  - SymbolicLink
     *
     *  @static
     */
    static get NODE_TYPES() { return NODE_TYPES }
    static NoSuchFileError(path) { return new Error(`NoSuchFileError: ${path}`) }
    static NotImplementedError(fn) { return new Error(`NotImplementedError: ${fn}`) }
    static PathNotAbsoluteError(path) { return new Error(`PathNotAbsoluteError: ${path}`) }

    /**
     * Creates a new {@link Node}.
     */
    constructor(options={}) {
        this[_EVENT] = new EventEmitter()
        this.options = options
    }

    _removeTrailingSep(path) {
        return path.replace(/\/$/, '')
    }

    on(...args) { this[_EVENT].on(...args) }
    once(...args) { this[_EVENT].once(...args) }
    emit(...args) { this[_EVENT].emit(...args) }

    sync() {this.emit('sync')}

    init() {
        this.once('sync', () => this.emit('ready'))
        this.sync()
    }
    // uri(path) {
        // return this.constructor.scheme + '://' + this.location
    // }

    /**
     * Get metadata about a node in the vfs.
     *
     * @param {string} path absolute path to the file
     * @return {Node} metadata about the file
     *
     */
    stat(path, cb)               { cb(fsvfs.NotImplementedError("stat")) }

    /**
     * @callback readdirCallback
     * @param {Error} err
     * @param {array} filenames list of relative path names in this folder
     */
    /**
     * List the nodes in a folder.
     *
     * @param {string} path absolute path to the folder
     * @param {readdirCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback fs#readdir}
     */
    readdir(path, cb)            { cb(fsvfs.NotImplementedError("readdir")) }
    mkdir(path, mode, cb)        { cb(fsvfs.NotImplementedError("mkdir")) }
    unlink(path, cb)             { cb(fsvfs.NotImplementedError("unlink")) }
    readFile(path, options, cb)  { cb(fsvfs.NotImplementedError("readFile")) }
    writeFile(path, options, cb) { cb(fsvfs.NotImplementedError("writeFile")) }

    mkdirRecursive(path, cb) {
        if (!Path.isAbsolute(path)) throw new Error(`'path' must be absolute: ${path}`)
        path = path.substr(1)
        var fullDir = ''
        async.eachSeries(path.split('/'), (dir, done) => {
            fullDir += '/' + Path.join(fullDir, dir)
            this.mkdir(fullDir, done)
        }, cb)
    }

    /**
     * Copy file, possibly across different VFS.
     * @param {string|Node} from
     * @param {string|Node} to
     * @param {function(err)} cb
     */
    copyFile(from, to, cb) {
        [from, to] = [from, to].map(arg => {
            if (typeof arg === 'string') { arg = {vfs: this, path: arg} }
            if (typeof arg === 'object') {
                if (!(arg.vfs instanceof fsvfs)) throw new Error("'arg.vfs' must be a vfs")
                if (typeof arg.path !== 'string') throw new Error("'arg.path' must be a string")
            }
            return arg
        })
        from.vfs.readFile(from.path, (err, data) => {
            if (err) return cb(err)
            if (data instanceof ArrayBuffer) {
                data = new Buffer(data)
            }
            to.vfs.writeFile(to.path, data, cb)
        })
    }

    /**
     * List recursive folder contents
     *
     * @param path string path
     * @param cb function (err, files)
     */
    find(path, cb) {
        const ret = []
        this.getdir(path, (err, files) => {
            async.each(files, (file, done) => {
                if (err) return done(err)
                if (file.isDirectory) 
                    this.find(file.path, (err, subfiles) => {
                        if (err) return done(err)
                        ret.push(file)
                        subfiles.forEach(subfile => ret.push(subfile))
                        return done()
                    })
                else {
                    ret.push(file)
                    return done()
                }
            }, (err) => {
                return cb(err, ret)
            })
        })
    }

    /**
     * Get directory contents as {@link Node} objects.
     *
     * Essentially a shortcut for {@link fsvfs#stat} applied to {@link fsvfs#getdir}.
     *
     * @param {string} dir
     * @param {object} options
     * @param {Node} options.parent=null
     * @return {function(err, nodes)} cb
     */
    // Like readdir but return attr objects
    getdir(dir, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this.readdir(dir, (err, filenames) => {
            if (err) return cb(err)
            async.map(filenames, (filename, done) => {
                this.stat(Path.join(dir, filename), (err, node) => {
                    if (err) return done(err)
                    return done(null, node)
                })
            }, (err, ret) => {
                if (err) return cb(err)
                if (! options.parent) 
                    return cb(null, ret)
                options.parent.vfs.stat(Path.join(options.parent.path, '..'), (err, parent) => {
                    if (parent) {
                        // const parent = options.parent
                        parent.pathLabel = '..'
                        ret.unshift(parent)
                    }
                    return cb(null, ret)
                })
            })
        })
    }

    /**
     * Recursive size of a node.
     *
     * @param path string
     */
    du(path, cb) {
        var totalSize = 0
        this.find(path, (err, files) => {
            if (err) return cb(err)
            files.forEach(file => totalSize += file.size)
            return cb(null, totalSize)
        })
    }

}
module.exports = fsvfs
