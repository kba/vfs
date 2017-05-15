const async = require('async')
const {EventEmitter} = require('events')
const Node = require('./node')
const Path = require('path')
const api = require('./api')

const errors = require('@kba/vfs-errors')

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

/** 
 * Base class of all vfs
 * @implements api
 * @interface
 */
class base extends api {

    static get Node() { return Node }

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

    /**
     * Lists the capabilities of a VFS, i.e. which methods are available
     *
     * @return {Set} set of available methods
     * @static
     */
    static get capabilities() {
        const toSkip = new Set(['constructor'])
        const ret = new Set()
        Object.getOwnPropertyNames(this.prototype)
            .filter(prop => !(toSkip.has(prop)))
            .map(prop => ret.add(prop.replace(/^_/, '')))
        const deps = {
            'getdir':         ['stat', 'readdir'],
            'find':           ['stat', 'readdir'],
            'mkdirRecursive': ['stat', 'mkdir'],
            'du':             ['stat', 'readdir'],
            'readFile':       ['stat', 'createReadStream'],
            'writeFile':      ['stat', 'writeFile'],
            'copyFile':       ['stat', 'readFile', 'writeFile'],
        }
        Object.getOwnPropertyNames(api.prototype)
            .filter(prop => !(toSkip.has(prop))
                && deps[prop] && deps[prop].every(prop => ret.has(prop)))
            .map(prop => ret.add(prop))
        return ret
    }
    /* to utils TODO */
    _removeTrailingSep(path) {
        return path.replace(/\/$/, '')
    }

    _applyPlugins(fn, args, cb) {
        const plugins = this.plugins.filter(plugin => plugin[fn])
        if (plugins.length === 0) return cb()
        return async.each(plugins, (plugin, done) => {return plugin[fn](...args, done)}, cb)
    }


    /* default implementation */
    _readFile(path, options, cb) {
        if (!Path.isAbsolute(path)) return cb(errors.PathNotAbsoluteError(path))
        try {
            var inStream = this.createReadStream(path, options)
            const bufs = []
            inStream.on('data', data => bufs.push(data))
            inStream.on('error', err => cb(err))
            inStream.on('end', () => {
                const buf = Buffer.concat(bufs)
                if (options.encoding)
                    return cb(null, buf.toString(options.encoding))
                return cb(null, buf)
            })
        } catch (err) {
            return cb(err)
        }
    }

    /* default implementation */
    _getdir(dir, options, cb) {
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

    /* default implementation */
    _copyFile(from, to, options, cb) {
        [from, to] = [from, to].map(arg => {
            if (typeof arg === 'string') { arg = {vfs: this, path: arg} }
            if (typeof arg === 'object') {
                if (!(arg.vfs instanceof api)) throw new Error("'arg.vfs' must be a vfs")
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

}
module.exports = base
