const express = require('express')
const morgan = require('morgan')

function createServer({dispatcher, port}) {

  const app = new express.Router()

  app.use(morgan('combined'))
  app.use(require('./middleware/cors'))
  app.use(require('./middleware/vfs')({dispatcher}))
  app.use('/dav', require('./route/webdav')({dispatcher, basepath: '/dav'}))
  app.use(require('./route/simple')({dispatcher}))

  return app
}

module.exports = createServer
