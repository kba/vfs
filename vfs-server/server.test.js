/* globals __filename */
const supertest = require('supertest')
const tap = require('tape')

const dispatcher = require('@kba/vfs')
dispatcher.enable(require('@kba/vfs-adapter-file'))
const server = require('./server')({dispatcher})
const app = require('express')()
app.use(server)
// console.log(app)

tap.test(`/stat?url=${__filename}`, t => {
    supertest(app)
        .get(`/stat?url=${__filename}`)
        // .get(`/`)
        .end((err, res) => {
            if (err) throw err
            t.equals(res.status, 200, '200')
            t.ok(res.body.stat, "JSON, contains 'stat'")
            t.end()
        })
})
