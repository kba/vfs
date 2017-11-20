const {Router} = require('express')
const bodyParser = require('body-parser')

/**
 * Simple API route
 */

module.exports = ({dispatcher}) => {

  const route = new Router()

  route.use(bodyParser.json())

  route.get('/stat', (req, res, next) => {
    const {url, options} = req.vfs
    console.log({url, options})
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

  route.get('/stream', (req, resp, next) => {
    const {url, options} = req.vfs
    const {path} = req.vfs.urlParsed
    const vfs = dispatcher.instantiate(url, options)
    vfs.stat(path, options, (err, stat) => {
      if (err) return next(err)
      const total = stat.size
      let status = 206
      let data = null
      const headers = {
        'Content-Type': stat.mimetype,
        'Accept-Ranges': 'bytes',
      }
      if (req.headers.range) {
        let range = req.headers.range
        let parts = range.replace(/bytes=/, "").split("-")
        let partialstart = parts[0]
        let partialend = parts[1]

        let start = parseInt(partialstart, 10)
        let end = partialend ? parseInt(partialend, 10) : total-1
        let chunksize = end - start + 1
        console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize)
        data = vfs.createReadStream(path, {start: start, end: end})
        status = 206
        headers['Content-Range']  = `bytes ${start}-${end}/${total}`
        headers['Content-Length'] = chunksize
      } else {
        headers['Content-Length'] = total
        data = vfs.createReadStream(path)
      }
      resp.writeHead(status, headers)
      data.pipe(resp)
    })
  })

  console.log("Initialized simple route")
  return route
}
