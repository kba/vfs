const urlParse = require('url').parse
const {UnsupportedFormatError} = require('@kba/vfs-util-errors')

class VfsDispatcher {

    constructor() {
        this.byScheme = {}
        this.instanceCache = {}
    }

    enable(vfs, options) {
        this.byScheme[vfs.scheme] = vfs
    }

    get(scheme='') {
        return this.byScheme[scheme]
    }

    parseUrl(url, options={}) {
        Object.assign(options, {
          parseQueryString: false,
          slashesDenoteHost: false
        }, options)
        let parts = urlParse(url, options.parseQueryString, options.slashesDenoteHost)
        if (!(parts.protocol)) {
            url = 'file://' + url
            parts = urlParse(url, options.parseQueryString, options.slashesDenoteHost)
        }
        parts.protocol = parts.protocol.replace(/:$/, '')
        if (parts.path) parts.path = decodeURIComponent(parts.path)
        if (!(parts.protocol in this.byScheme)) {
            throw UnsupportedFormatError(`${parts.protocol} not available. Did you run
            vfs.enable(require('@kba/vfs-${parts.protocol}') ?`)
        }
        return parts
    }

    vfsByUrl(url, options={}) {
        const {protocol} = this.parseUrl(url, options)
        return this.byScheme[protocol]
    }

    instantiate(vfs, options={}) {
        if (typeof vfs === 'string') {
            vfs = this.vfsByUrl(vfs)
        }
        const key = `${vfs.scheme}__${JSON.stringify(options)}`
        if (!(key in this.instanceCache)) {
            const instance = new vfs(options)
            this.instanceCache[key] = instance
        }
        return this.instanceCache[key]
    }
}

module.exports = VfsDispatcher
