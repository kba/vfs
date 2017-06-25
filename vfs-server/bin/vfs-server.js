#!/usr/bin/env node
const dispatcher = require('@kba/vfs')
dispatcher.enable(require('@kba/vfs-file'))
const createServer = require('../server')
const port = 3001

const server = createServer({dispatcher})
console.log(`Listening on port ${port} (${new Date()})`)
server.listen(port)
