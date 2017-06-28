const {Router} = require('express')

/**
 * WebDAV route
 */
class DavRoute {
    constructor({dispatcher, basepath}) {
        this.dispatcher = dispatcher
        this.basepath = basepath
    }

    nodeToDavResponse(node) {
        const resourcetype = node.isDirectory 
            ? '<resourcetype><collection/></resourcetype>' 
            : '<resourcetype/>'
        const displayname = node.path
        const getlastmodified = node.mtime.toUTCString()
        const href = this.basepath + node.path
        const getcontentlength = node.size
        return `
    <response>
        <href>${href}</href>
        <propstat>
            <prop>
                <getlastmodified>${getlastmodified}</getlastmodified>
                <getcontentlength>${getcontentlength}</getcontentlength>
                <creationdate>1997-12-01T17:42:21-08:00</creationdate>
                <displayname>${displayname}</displayname>
                ${resourcetype}
            </prop>
            <status>HTTP/1.1 200 OK</status>
        </propstat>
    </response>`
    } 

    propfind(req, resp, next) {
        console.log("IN", req.body)
        console.log(req.params.path)
        resp.status(207)
        resp.header('Content-Type', 'application/xml')
        const {path} = req.params
        const vfs = this.dispatcher.instantiate(path)
        vfs.getdir(path, (err, files) => {
            if (err) return next(err)
            console.log({err, files})
            let out = `<?xml version="1.0" encoding="utf-8" ?>
<multistatus xmlns="DAV:">`
            files.forEach(node => {
                out += this.nodeToDavResponse(node)
            })
            out += `
</multistatus>`
            console.log("OUT", out)
            resp.send(out)
        })
    }

    create() {
        const route = new Router()
        route.get('/:path(*)', this.propfind.bind(this))
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
