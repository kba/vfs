const tap = require('tap')
const async = require('async')
const Path = require('path')
const fsvfs = require('../lib')
const fs = new(fsvfs.file)()

tap.test('EventEmitter composition', t => {
    fs.once('foo', (val) => {
        t.ok(val, "event trigered")
        t.end()
    })
    fs.emit('foo', true)
})

