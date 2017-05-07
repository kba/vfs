const mimeTypes = require('mime-types')
const errors = require('./errors')
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


/**
 * The vfs was synced with any underlying vfs
 * @event sync
 * @memberof api
 */
/**
 * The vfs was setup initially synced
 * @event init
 * @memberof api
 */
/** 
 * API of vfs
 * @interface
 */
class api {

    /**
     * Lists the capabilities of a VFS, i.e. which methods are available
     *
     * @return {Set} set of available methods
     * @static
     */
    static get capabilities() { return new Set() }

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

    sync() { throw(errors.NotImplementedError('sync'))}

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
    stat(path, cb) { throw(errors.NotImplementedError("stat")) }

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
    readdir(path, cb) { throw(errors.NotImplementedError("readdir")) }

    /**
     * @param {string} path absolute path to the folder
     * @param {errorCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback fs#mkdir}
     */
    mkdir(path, mode, cb) { throw(errors.NotImplementedError("mkdir")) }

    /**
     * @param {string} path absolute path to the folder
     * @param {errorCallback} cb
     * @see {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback fs#unlink}
     */
    unlink(path, cb) { throw(errors.NotImplementedError("unlink")) }

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
    readFile(path, options, cb){ throw errors.NotImplementedError('readFile') }

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
    writeFile(path, options, cb){ throw errors.NotImplementedError('writeFile') }

    /**
     * mkdir -p
     * @param {string} path absolute path to the folder to create
     * @param {errorCallback} cb
     */
    mkdirRecursive(path, cb) {throw errors.NotImplementedError('mkdirRecursive')}

    /**
     * Copy file, possibly across different VFS.
     * @param {string|Node} from
     * @param {string|Node} to
     * @param {errorCallback} cb
     */
    copyFile(from, to, cb) {throw errors.NotImplementedError('copyFile')}

    /**
     * List recursive folder contents
     *
     * @param path string path
     * @param cb function (err, files)
     */
    find(path, cb) {throw errors.NotImplementedError('find')}

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
    getdir(dir, options, cb) {throw errors.NotImplementedError('getdir')}

    /**
     * Recursive size of a node.
     *
     * @param {string} path absolute path to the file
     */
    du(path, cb) {throw errors.NotImplementedError('du')}

    /**
     * Create a ReadableStream from a file
     *
     * @param {string} path absolute path to the file
     */
    createReadStream(path, options) {throw errors.NotImplementedError('createReadStream') }

    /**
     * Create a ReadableStream from a file
     *
     * @param {string} path absolute path to the file
     */
    createWriteStream(path, options) {throw errors.NotImplementedError('createWriteStream') }


}
module.exports = api
