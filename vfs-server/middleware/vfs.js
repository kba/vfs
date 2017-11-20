module.exports = function vfsMiddleware({dispatcher}) {
    return (req, res, next) => {
        const options = {}
        let urlParsed = {}
        let url = null
        if (req.header['x-vfs-options'])
            Object.assign(options, JSON.parse(req.header['x-vfs-options']))
        if (req.query.options)
            Object.assign(options, JSON.parse(req.query.options))
        Object.keys(req.query)
            .filter(k => k.match(/^opt\./))
            .forEach(k => {
                try {
                    options[k.substr(4)] = JSON.parse(req.query[k])
                } catch (e) {
                    options[k.substr(4)] = req.query[k]
                }
            })
        if (req.header['x-vfs-url'])
            url = req.header['x-vfs-url']
        if (req.query.url) {
            url = req.query.url
        }
        if (url) {
            urlParsed = dispatcher.parseUrl(decodeURIComponent(url), options)
            url = urlParsed.href
        }
        console.log('vfsMiddleware', {url, options})
        req.vfs = {url, urlParsed, options}
        next()
    }
}

