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

    static get capabilities() {
        const toSkip = new Set(['constructor'])
        const ret = new Set()
        Object.getOwnPropertyNames(this.prototype)
            // .filter(prop => !(prop.indexOf('_') === 0))
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
        Object.getOwnPropertyNames(base.prototype)
            // .filter(prop => prop.indexOf('_') === 0)
            .filter(prop => !(toSkip.has(prop))
                && deps[prop] && deps[prop].every(prop => ret.has(prop)))
            .map(prop => ret.add(prop))
        return ret
    }
    static get Node() { return Node }

    constructor(options={}) {
        super()
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

    _removeTrailingSep(path) {
        return path.replace(/\/$/, '')
    }

    sync() {this.emit('sync')}

    readFile(path, options, cb) {
        if (!Path.isAbsolute(path)) return cb(errors.PathNotAbsoluteError(path))
        if (typeof options === 'function') [cb, options] = [options, {}]
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

    mkdirRecursive(path, cb) {
        if (!Path.isAbsolute(path)) throw new Error(`'path' must be absolute: ${path}`)
        path = path.substr(1)
        var fullDir = ''
        async.eachSeries(path.split('/'), (dir, done) => {
            fullDir += '/' + Path.join(fullDir, dir)
            this.mkdir(fullDir, done)
        }, cb)
    }

    copyFile(from, to, cb) {
        [from, to] = [from, to].map(arg => {
            if (typeof arg === 'string') { arg = {vfs: this, path: arg} }
            if (typeof arg === 'object') {
                if (!(arg.vfs instanceof base)) throw new Error("'arg.vfs' must be a vfs")
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

    _applyPlugins(fn, args, cb) {
        const plugins = this.plugins.filter(plugin => plugin[fn])
        if (plugins.length === 0) return cb()
        return async.each(plugins, (plugin, done) => {return plugin[fn](...args, done)}, cb)
    }

    stat(path, options, cb) {
        if (typeof options === 'function') [cb, options] = [options, {}]
        this._stat(path, options, (err, node) => {
            if (err) return cb(err)
            this._applyPlugins('stat', [node], (err) => {
                return cb(err, node)
            })
        })
    }

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

    du(path, cb) {
        var totalSize = 0
        this.find(path, (err, files) => {
            if (err) return cb(err)
            files.forEach(file => totalSize += file.size)
            return cb(null, totalSize)
        })
    }

}
module.exports = base
