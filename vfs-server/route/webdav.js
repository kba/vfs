const {Router} = require('express')
const bodyParser = require('body-parser')

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

  _respond404(path) {
    const ret =`
<response>
    <href>${this.basepath}${path}</href>
    <propstat>
        <status>HTTP/1.1 404 Not found</status>
    </propstat
</response>
            `
    return ret
  }

  move(req, resp, next) {
    const source = '/' + req.params.path
    const dest = req.headers.destination
      .replace(/^https?:\/\//, '')
      .replace(/^[^\/]+/, '')
      .replace(this.basepath, '')
    console.log(`${source} -> ${dest}`)
    resp.status(404)
    return resp.end()
  }

  delete(req, resp, next) {
    const path = '/' + req.params.path
    const vfs = this.dispatcher.instantiate(path, req.vfsOptions)
    vfs.stat(path, (err, stat) => {
      if (err) {
        this._sendMultistatus(resp, this._respond404(path))
        return
      }
      console.log(stat.isDirectory ? 'rmdir' : 'unlink')
      vfs[stat.isDirectory ? 'rmdir' : 'unlink'](path, req.vfsOptions, err => {
        if (err) {
          console.log("ERROR", err)
          resp.status(403)
          resp.end()
        } else {
          resp.status(200)
          resp.end()
        }
      })
    })
  }

  put(req, resp, next) {
    const path = '/' + req.params.path
    const vfs = this.dispatcher.instantiate(path, req.vfsOptions)
    const outstream = vfs.createWriteStream(path, req.vfsOptions)
    outstream.on('finish', () => {
      resp.status(200)
      resp.end()
    })
    outstream.write(req.body)
    outstream.end()
    resp.end()
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
      if (err) {
        this._sendMultistatus(resp, this._respond404(path))
        return
      }
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

  initRoute() {
    const route = new Router()

    const xmlBodyParser = bodyParser.text({type: 'application/xml'})

    route.get('/:path(*)', [xmlBodyParser, this.propfind.bind(this)])
    route.mkcol('/:path(*)', [xmlBodyParser, this.mkcol.bind(this)])
    route.put('/:path(*)', [bodyParser.raw(), this.put.bind(this)])
    route.propfind('/:path(*)', [xmlBodyParser, this.propfind.bind(this)])
    route.delete('/:path(*)', [this.delete.bind(this)])
    route.move('/:path(*)', [this.move.bind(this)])
    route.options('/:path(*)', (req, resp, next) => {
      resp.header('DAV', '1,2,3')
      resp.end()
    })

    return route
  }
}


module.exports = (options) => {
  return new DavRoute(options).initRoute()
}
