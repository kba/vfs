const async = require('async')
const {EventEmitter} = require('events')
const Node = require('./node')
const Path = require('path')

const _EVENT = Symbol('event')

/** 
 * Base class of all vfs
 * @implements api
 * @interface
 */
class api {

    constructor(options={}) {
        this.options = options
        // TODO plugins
        this.plugins = []

        this[_EVENT] = new EventEmitter()
        ;['on', 'once', 'emit'].forEach(k => {
            Object.defineProperty(this, k, {
                enumerable: false,
                value: this[_EVENT][k].bind(this[_EVENT]),
            })
        })
    }

    use(pluginClass, pluginOptions) {
        const plugin = new pluginClass(pluginOptions)
        this.plugins.push(plugin)
    }

    /**
     * Result of stat-ing a file
     *
     * @callback statCallback
     * @param {Error} err if file could not be found/accessed
     * @param {Node} node the {@link vfs.Node}
     */
    /**
     * Get metadata about a node in the vfs.
     *
     * @param {string} path absolute path to the file
     * @param {statCallback} cb error or {@link Node}
     *
     */
    stat(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._stat(path, options, (err, node) => {
            if (err) return cb(err)
            this._applyPlugins('stat', [node], (err) => {
                return cb(err, node)
            })
        })
    }

    /**
     * @param {string} path absolute path to the folder
     * @param {errorCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback fs#mkdir}
     */
    mkdir(path, mode, cb) {
        if (typeof mode === 'function') [cb, mode] = [mode, {}]
        return this._mkdir(path, mode, cb)
    }

    /**
     * Initialize the filesystem.
     *
     * By default only calls #sync and emits {@link 'ready'} on {@link 'sync'}
     */
    init() {
        this.once('sync', () => this.emit('ready'))
        this.sync()
    }

    /**
     * Sync the filesystem.
     *
     */
    sync(options={}) {
        return this._sync(options)
    }

    /**
     * Create a ReadableStream from a file
     *
     * @param {string} path absolute path to the file
     */
    createReadStream(path, ...args) {
        return this._createReadStream(path, ...args)
    }

    /**
     * Create a WritableStream to a file
     *
     * @param {string} path absolute path to the file
     */
    createWriteStream(path, ...args) {
        return this._createWriteStream(path, ...args)
    }

    /**
     * @callback readFileCallback
     * @param {Error} err
     * @param {Buffer|String} data the file data as a buffer or stream
     */
    /**
     * @param {string} path absolute path to the file
     * @param {object} options
     * @param {object} options.encoding=undefined Encoding of the data. Setting this will return a String
     * @param {readFileCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback fs#readFile}
     */
    readFile(path, options, cb){
        if (typeof options === 'function') [cb, options] = [options, {}]
        return this._readFile(path, options, cb)
    }

    /**
     * Only contains an exception as the first argument in case of failure
     *
     * @callback errorCallback
     * @param err {undefined|Error} If undefined, operation was successful, if
     *      an Error: the reason for failure
     */
    /**
     * @param {string} path absolute path to the file
     * @param {object} options
     * @param {errorCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback fs#writeFile}
     */
    writeFile(path, data, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return this._writeFile(path, data, options, cb)
    }

    /**
     * @param {string} path absolute path to the folder
     * @param {errorCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback fs#unlink}
     */
    unlink(path, options, cb) {
        return this._unlink(path, options, cb)
    }

    /**
     * mkdir -p
     * @param {string} path absolute path to the folder to create
     * @param {errorCallback} cb
     */
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
     * @param {errorCallback} cb
     */
    copyFile(from, to, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._copyFile(from, to, options, cb)
    }

    /**
     * Get directory contents as {@link Node} objects.
     *
     * Essentially a shortcut for {@link api#stat} applied to {@link api#getdir}.
     *
     * @param {string} dir
     * @param {object} options
     * @param {Node} options.parent=null
     * @return {function(err, nodes)} cb
     */
    getdir(dir, options, cb) {
        return this._getdir(dir, options, cb)
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
     * Recursive size of a node.
     *
     * @param {string} path absolute path to the file
     */
    du(path, cb) {
        var totalSize = 0
        this.find(path, (err, files) => {
            if (err) return cb(err)
            files.forEach(file => totalSize += file.size)
            return cb(null, totalSize)
        })
    }

    /**
     * Result of listing directory contents
     *
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
    readdir(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._readdir(path, options, cb)
    }


}
module.exports = api
