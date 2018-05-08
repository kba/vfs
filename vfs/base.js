const async = require('async')
const Node = require('./node')
const Path = require('path')
const api = require('./api')

const errors = require('@kba/vfs-util-errors')

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
 * ### vfs.base
 * 
 * Base class of all vfs
 * 
 * Provides default implementations for [some api methods](#vfsapi).
 * 
 */
class base extends api {

    static get Node() {return Node}

    /**
     * #### `(static) NODE_TYPES`
     * 
     * Types a [vfs.Node](#vfsnode) can have.
     * 
     * Currently:
     *  - `Directory`
     *  - `SymbolicLink`
     *
     */
    static get NODE_TYPES() {return NODE_TYPES}

    /**
     * #### `(static) capabilities`
     * 
     * Lists the capabilities of a VFS, i.e. which methods are available
     * 
     * - `@return {Set}` set of available methods
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
            'nextFile':       ['stat', 'readdir'],
        }
        const props = Object.getOwnPropertyNames(api.prototype)
        props.filter(prop => !(toSkip.has(prop))
                && deps[prop] && deps[prop].every(prop => ret.has(prop)))
            .map(prop => ret.add(prop))
        return ret
    }

    constructor(...args) {super(...args)}

    _applyPlugins(fn, args, cb) {
        const plugins = this.plugins.filter(plugin => plugin[fn])
        if (plugins.length === 0) return cb()
        return async.each(plugins, (plugin, done) => {return plugin[fn](...args, done)}, cb)
    }

    /* readFile default implementation */
    _readFile(path, options, cb) {
        if (!Path.isAbsolute(path)) return cb(errors.PathNotAbsoluteError(path))
        try {
            let inStream = this.createReadStream(path, options)
            const bufs = []
            inStream.on('data', data => {
              if (typeof data === 'string')
                data = Buffer.from(data)
              bufs.push(data)
            })
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

    /* getdir default implementation */
    _getdir(dir, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this.readdir(dir, (err, filenames) => {
            if (err) return cb(err)
            async.map(filenames, (filename, done) => {
                filename = Path.join(dir, filename)
                this.stat(filename, (err, node) => {
                    if (err) return done(err)
                    return done(null, node)
                })
            }, (err, ret) => {
                if (err) return cb(err)
                if (options.sortBy) {
                    let {sortBy, sortDir} = options
                    sortDir = sortDir || + 1
                    ret = ret.sort((objA, objB) => {
                        const [a, b] = [objA, objB].map(x => {
                            x = x[sortBy]
                            if (x instanceof Date) x = x.getTime()
                            return x
                        })
                        return sortDir * (a == b ? 0 : a < b ? -1 : +1)
                    })
                }
                if (options.directoriesFirst) {
                  const tmp = [[], []]
                  ret.forEach(node => {
                    tmp[node.isDirectory ? 0 : 1].push(node)
                  })
                  ret = [...tmp[0], ...tmp[1]]
                }
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

    /* copyFile default implementation */
    _copyFile(from, to, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        ;[from, to] = [from, to].map(arg => {
            if (typeof arg === 'string') {arg = {vfs: this, path: arg}}
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

    _nextFile(path, options, cb) {
        // TODO normalize path
        this.stat(path, (err, node) => {
            if (err) return cb(err)
            if (node['%dir'] === path) return cb(new Error("Already at root"))
            this.getdir(node['%dir'], (err, _files) => {
                if (err) return cb(err)
                const files = _files
                    .filter(f => options.whitelistFn(f))
                    .filter(f => ! options.blacklistFn(f))
                // console.log(filtered.map(p => p.path))
                const idx = files.findIndex(f => f.path == path)
                let nextIdx = idx + options.delta
                if (nextIdx >= files.length || nextIdx < 0) {
                    if (options.wrapStrategy === 'wrap') {
                        nextIdx %= files.length
                        if (nextIdx < 0) nextIdx = files.length + nextIdx
                    } else {
                        cb(errors.NotImplementedError(`wrapStrategy ${options.wrapStrategy}`))
                    }
                }
                const nextFile = files[nextIdx]
                return cb(null, nextFile)
            })
        })
    }

}
module.exports = base
