const {Router} = require('express')

/**
 * WebDAV route
 */
class DavRoute {

    constructor({dispatcher, basepath}) {
        this.dispatcher = dispatcher
        this.basepath = basepath
    }

    _nodeToDavResponse(node) {
        const resourcetype = node.isDirectory 
            ? '<resourcetype><collection/></resourcetype>' 
            : '<resourcetype/>'
        const displayname = node.path
        const getlastmodified = node.mtime.toUTCString()
        const creationdate = node.ctime.toUTCString()
        const href = this.basepath + node.path
        const getcontenttype = node.mimetype
        // const href = node.path
        const getcontentlength = node.size
        return `
    <response>
        <href>${href}</href>
        <propstat>
            <prop>
                <creationdate>${creationdate}</creationdate>
                <getlastmodified>${getlastmodified}</getlastmodified>
                <getcontentlength>${getcontentlength}</getcontentlength>
                <getcontenttype>${getcontenttype}</getcontenttype>
                <displayname>${node["%base"]}</displayname>
                ${resourcetype}
            </prop>
            <status>HTTP/1.1 200 OK</status>
        </propstat>
    </response>`
    }

    _sendMultistatus(resp, inner) {
        const ret = `<?xml version="1.0" encoding="utf-8" ?>
<multistatus xmlns="DAV:">${inner}
</multistatus>
`
        console.log("MULTISTATUS", ret)
        resp.status(207)
        resp.header('Content-Type', 'application/xml')
        resp.send(ret)
    }

    mkcol(req, resp, next) {
        const path = '/' + req.params.path
        const vfs = this.dispatcher.instantiate(path, req.vfsOptions)
        vfs.mkdir(path, (err) => {
            if (err) {
                console.log("ERROR", err)
                resp.status(401)
                resp.end()
            } else {
                resp.status(201)
                resp.end()
            }
        })
    }

    propfind(req, resp, next) {
        const {body} = req
        const path = '/' + req.params.path
        console.log("PATH", path)
        console.log("BODY", body)
        const vfs = this.dispatcher.instantiate(path, req.vfsOptions)
        vfs.stat(path, (err, pathNode) => {
            let out = this._nodeToDavResponse(pathNode)
            if (pathNode.isDirectory) {
                vfs.getdir(pathNode.path, (err, files) => {
                    if (err) return next(err)
                    files.forEach(node => {
                        out += this._nodeToDavResponse(node)
                    })
                    this._sendMultistatus(resp, out)
                })
            } else {
                this._sendMultistatus(resp, out)
            }
        })
    }

    create() {
        const route = new Router()
        route.get('/:path(*)', this.propfind.bind(this))
        route.mkcol('/:path(*)', this.mkcol.bind(this))
        route.propfind('/:path(*)', this.propfind.bind(this))
        route.options('/:path(*)', (req, resp, next) => {
            resp.header('DAV', '1,2,3')
            resp.end()
        })
        return route
    }
}


module.exports = (options) => {
    return new DavRoute(options).create()
}
// function webdavRoute(options, cb) {
// }
