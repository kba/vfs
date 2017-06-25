#!/usr/bin/env node
const dispatcher = require('@kba/vfs')
dispatcher.enable(require('@kba/vfs-file'))
const port = process.env.VFS_PORT || 3001

const server = new(require('express'))()
server.use(require('../server')({dispatcher}))
console.log(`Listening on port ${port} (${new Date()})`)
server.listen(port)
