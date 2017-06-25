const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

function vfsMiddleware({dispatcher}) {
    return (req, res, next) => {
        console.log('yay')
        const ret = {
            options: {},
            urlParsed: {},
            url: null,
        }
        if (req.header['x-vfs-options'])
            Object.assign(ret.options, JSON.parse(req.header['x-vfs-options']))
        if (req.query.options)
            Object.assign(ret.options, JSON.parse(req.query.options))
        if (req.header['x-vfs-url'])
            ret.url = req.header['x-vfs-url']
        if (req.query.url) {
            ret.url = req.query.url
        }
        if (ret.url) {
            ret.urlParsed = dispatcher.parseUrl(ret.url, ret.options)
            ret.url = ret.urlParsed.href
        }
        req.vfs = ret
        next()
    }
}

function createServer({dispatcher, port}) {
    const app = new express()
    app.use(vfsMiddleware({dispatcher}))
    app.use(bodyParser.json())
    app.use(morgan('dev'))

    app.get('/stat', (req, res, next) => {
        const {url, urlParsed, options} = req.vfs
        const vfs = dispatcher.instantiate(url, options)
        vfs.stat(urlParsed.path, options, (err, stat) => {
            if (err) return next(err)
            return res.send({stat})
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
