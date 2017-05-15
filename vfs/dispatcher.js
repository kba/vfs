const urlParse = require('url').parse
const {UnsupportedFormatError} = require('@kba/vfs-util-errors')

class VfsDispatcher {

    constructor() {
        this.byScheme = {}
    }

    enable(vfs) {
        this.byScheme[vfs.scheme] = vfs
    }

    get(scheme='') {
        return this.byScheme[scheme]
    }

    open(url, options) {
        if (!('parseQueryString' in options))
            options.parseQueryString = false
        if (!('slashDenoteHost' in options))
            options.slashDenoteHost = false
        const parts = urlParse(url, options.parseQueryString, options.slashDenoteHost)
        parts.protocol = parts.protocol.replace(/:$/, '')
        if (!(parts.protocol in this.byScheme)) {
            throw new UnsupportedFormatError(`${parts.protocol} not available. Did you run
            vfs.enable(require('@kba/vfs-${parts.protocol}') ?`)
        }
    }
}

module.exports = VfsDispatcher
