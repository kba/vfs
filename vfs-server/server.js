const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')


function createServer({dispatcher, port}) {
  const app = new express.Router()
  app.use(morgan('combined'))

  const cors = require('./middleware/cors')
  app.use(cors)

  const vfsMiddleware = require('./middleware/vfs')({dispatcher})
  app.use(vfsMiddleware)

  const davRoute = require('./route/webdav')({
    dispatcher,
    basepath: '/dav'
  })
  app.use('/dav', [bodyParser.text({type: 'application/xml'}), davRoute])

  const simpleRoute = require('./route/simple')({dispatcher})
  app.use([bodyParser.json(), simpleRoute])

  return app
}

module.exports = createServer
