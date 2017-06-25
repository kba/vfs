const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

function vfsMiddleware({dispatcher}) {
    return (req, res, next) => {
        const options = {}
        var urlParsed = {}
        var url = null
        if (req.header['x-vfs-options'])
            Object.assign(options, JSON.parse(req.header['x-vfs-options']))
        if (req.query.options)
            Object.assign(options, JSON.parse(req.query.options))
        Object.keys(req.query)
            .filter(k => k.match(/^opt\./))
            .forEach(k => {
                try {
                    options[k.substr(4)] = JSON.parse(req.query[k])
                } catch(e) {
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

function createServer({dispatcher, port}) {
    const app = new express.Router()
    app.use(vfsMiddleware({dispatcher}))
    app.use(bodyParser.json())
    app.use(morgan('dev'))

    app.get('/stat', (req, res, next) => {
        const {url, urlParsed, options} = req.vfs
        const vfs = dispatcher.instantiate(url, options)
        const {path} = req.vfs.urlParsed
        vfs.stat(path, options, (err, stat) => {
            if (err) return next(err)
            if (! stat.isDirectory) {
                return res.send({stat})
            } else {
                vfs.getdir(path, options, (err, ls) => {
                    if (err) return next(err)
                    return res.send(ls)
                })
            }
        })
    })

    app.get('/stream', (req, resp, next) => {
        const {url, options} = req.vfs
        const {path} = req.vfs.urlParsed
        const vfs = dispatcher.instantiate(url, options)
        vfs.stat(path, options, (err, stat) => {
            if (err) return next(err)
            const total = stat.size
            var status = 206
            var data = null
            const headers = {
                'Content-Type': stat.mimetype,
                'Accept-Ranges': 'bytes',
            }
            if (req.headers.range) {
                var range = req.headers.range;
                var parts = range.replace(/bytes=/, "").split("-");
                var partialstart = parts[0];
                var partialend = parts[1];

                var start = parseInt(partialstart, 10);
                var end = partialend ? parseInt(partialend, 10) : total-1;
                var chunksize = end - start + 1;
                console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
                data = vfs.createReadStream(path, {start: start, end: end});
                status = 206
                headers['Content-Range']  = `bytes ${start}-${end}/${total}`
                headers['Content-Length'] = chunksize
            } else {
                headers['Content-Length'] = total
                data = vfs.createReadStream(path)
            }
            resp.writeHead(status, headers)
            data.pipe(resp);
        })
    })

    return app
}

module.exports = createServer
