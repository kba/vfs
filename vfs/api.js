const async = require('async')
const {EventEmitter} = require('events')
const Path = require('path')

const _EVENT = Symbol('event')

/** 
 * ### vfs.api
 * Interface of all vfs
 *
 */
class api {

    /**
     * #### Constructor
     */
    constructor(options={}) {
        this.options = options

        this[_EVENT] = new EventEmitter()
        ;['on', 'once', 'emit'].forEach(k => {
            Object.defineProperty(this, k, {
                enumerable: false,
                value: this[_EVENT][k].bind(this[_EVENT]),
            })
        })

        this.plugins = []
        if ('plugins' in options) {
            options.plugins.forEach(([pluginClass, pluginOptions]) => {
                this.use(pluginClass, pluginOptions)
            })
        }
    }

    /**
     * #### `use(pluginClass, pluginOptions)`
     * 
     * Enable a plugin
     *
     */
    use(pluginClass, pluginOptions) {
        const plugin = new pluginClass(pluginOptions)
        this.plugins.push(plugin)
    }

    /**
     * #### `stat(path, options, callback)`
     * 
     * Get metadata about a node in the vfs.
     *
     * - `@param {String} path` absolute path to the file
     * - `@param {Function} callback` error or {@link Node}
     *
     */
    stat(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._stat(path, options, (err, node) => {
            if (err) return cb(err)
            this._applyPlugins('after_stat', [node], (err) => {
                return cb(err, node)
            })
        })
    }

    /**
     * #### `mkdir(path, mode, callback)`
     * 
     * Create a directory
     * 
     * - `@param {string} path` absolute path to the folder
     * - `@param {errorCallback} cb`
     * - @see [fs#mkdir](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback)
     */
    mkdir(path, mode, cb) {
        if (typeof mode === 'function') [cb, mode] = [mode, {}]
        return this._mkdir(path, mode, cb)
    }

    /**
     * #### `init()`
     * 
     * Initialize the filesystem.
     * 
     * By default only calls #sync and emits [`ready`](#events-ready) on [`sync`](#events-sync)}
     */
    init() {
        this.once('sync', () => this.emit('ready'))
        this.sync()
    }

    /**
     * #### `end()`
     *
     * Un-initialize the filesystem, e.g. disconnect a client.
     *
     */
    end() {
        if (this._end) this._end()
        else this.emit('end')
    }

    /**
     * #### `sync(options)`
     * 
     * Sync the filesystem.
     *
     */
    sync(options={}) {
        return this._sync(options)
    }

    /**
     * #### `createReadStream(path, options)`
     *
     * See [fs.createReadStream](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)
     *
     * Create a ReadableStream from a file
     *
     * @param {string} path absolute path to the file
     */
    createReadStream(path, ...args) {
        return this._createReadStream(path, ...args)
    }

    /**
     * #### `createWriteStream(path, options)`
     * 
     * Create a WritableStream to a file
     * 
     * See [fs.createWriteStream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options).
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
     * #### `readFile(path, options, callback)`
     * 
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback fs#readFile}
     * 
     * - `@param {string} path` absolute path to the file
     * - `@param {object} options`
     * - `@param {object} options.encoding=undefined` Encoding of the data. Setting this will return a String
     * - `@param {readFileCallback} cb`
     */
    readFile(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return this._readFile(path, options, cb)
    }

    /**
     * #### `writeFile(path, data, options, callback)`
     * 
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback fs#writeFile}
     * 
     * - `@param {string} path` absolute path to the file
     * - `@param {object} options`
     * - `@param {function(err)}` cb
     */
    writeFile(path, data, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return this._writeFile(path, data, options, cb)
    }

    /**
     * #### `unlink(path, options, cb)`
     * 
     * @param {string} path absolute path to the folder
     * @param {errorCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback fs#unlink}
     */
    unlink(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return this._unlink(path, options, cb)
    }

    /**
     * #### `mkdirRecursive(path, cb)`
     * 
     * mkdir -p
     * 
     * @param {string} path absolute path to the folder to create
     * @param {errorCallback} cb
     */
    mkdirRecursive(path, cb) {
        if (!Path.isAbsolute(path)) throw new Error(`'path' must be absolute: ${path}`)
        path = path.substr(1)
        let fullDir = ''
        async.eachSeries(path.split('/'), (dir, done) => {
            fullDir += '/' + Path.join(fullDir, dir)
            this.mkdir(fullDir, done)
        }, cb)
    }

    /**
     * #### `copyFile(from, to, options, cb)`
     * 
     * Copy file, possibly across different VFS.
     * 
     * @param {string|Node} from
     * @param {string|Node} to
     * @param {errorCallback} cb
     */
    copyFile(from, to, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._copyFile(from, to, options, cb)
    }

    /**
     * #### `getdir(dir, options, callback)`
     * 
     * Get directory contents as {@link Node} objects.
     *
     * Essentially a shortcut for {@link api#stat} applied to {@link api#getdir}.
     *
     * - @param {string} dir
     * - @param {object} options
     *   - @param {Node} options.parent=null
     *   - @param {string} options.sortBy=null
     *   - @param {number} options.sortDir=-1
     * - @return {function(err, nodes)} cb
     */
    getdir(dir, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        return this._getdir(dir, options, cb)
    }

    // TODO should accept options
    /**
     * #### `find(path, callback)`
     * 
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


    // TODO should accept options
    /**
     * #### `du(path, callback)`
     * 
     * Recursive size of a node.
     *
     * @param {string} path absolute path to the file
     */
    du(path, cb) {
        let totalSize = 0
        this.find(path, (err, files) => {
            if (err) return cb(err)
            files.forEach(file => totalSize += file.size)
            return cb(null, totalSize)
        })
    }

    /**
     * #### `readdir(path, options, callback)`
     * 
     * List the nodes in a folder.
     *
     * @see [fs#readdir](https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback).
     *
     * - `@param {string} path` absolute path to the folder
     * - `@param {function(err, filenames)} callback`
     *   - `@param {Error} err`
     *   - `@param {array} filenames` list of relative path names in this folder
     */
    readdir(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._readdir(path, options, cb)
    }

    /**
     * #### `nextFile(path, options, callback)`
     * 
     * Find the next file starting from path
     *
     * - `@param {string} path` absolute path to the file
     * - `@param {object} options`
     *   - `@param {boolean} delta` Offset. Set to negative to get previous file. Default: +1
     *   - `@param {function(path)} whitelistFn` Consider only paths for which this fn returns true
     *   - `@param {function(path)} blacklistFn` Discard all paths for which this fn returns true
     *   - `@param {String} wrapStrategy` What to do when hitting a directory boundary
     *      - `throw` Throw an error when files are exhausted
     *      - `wrap` Jump from beginning to end / vice versa (Default)
     *      - `jump` Jump to first file in next folder / last file in previous folder
     * - `@param {function(err, nextPath)} callback`
     *   - `@param {Error} err`
     *   - `@param {array} filenames` list of relative path names in this folder
     */
    nextFile(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        if (!(options.delta)) options.delta = +1
        if (!(options.wrapStrategy)) options.wrapStrategy = 'wrap'
        if (!(options.whitelistFn)) options.whitelistFn = p => true
        if (!(options.blacklistFn)) options.blacklistFn = p => false
        this._nextFile(path, options, cb)
    }

    rmdir(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._rmdir(path, options, cb)
    }

    _urlForNode(node) {
        return this.constructor.scheme + '://' + node.path
    }

    /**
     * #### Events
     *
     * ##### Events: `ready`
     * ##### Events: `sync`
     * ##### Events: `error`
     * ##### Events: `end`
     */


}

//
// Promisified API
//

api.prototype.promisify = function() {
  const store = this
  const ret = {}
  ;[
    'stat',
    'mkdir',
    'createReadStream',
    'createWriteStream',
    'readFile',
    'writeFile',
    'unlink',
    'mkdirRecursive',
    'copyFile',
    'getdir',
    'find',
    'du',
    'readdir',
    'nextFile',
    'rmdir',
  ].map(fn => {
    ret[fn] = (...args) => {
      return new Promise((resolve, reject) => {
        return store[fn](...args, (err, ...ret) => err ? reject(err) : resolve(...ret))
      })
    }
  })
  return ret
}
module.exports = api

// vim: sw=4 ts=4
