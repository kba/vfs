const tap = require('tap')
const fsvfs = require('../lib')
const fs = new(fsvfs.file)()
const Path = require('path')

tap.test('vfs-file', (t) => {
    t.equals(fsvfs.file.scheme, 'file')
    t.test('vfs-file / getdir', (t) => {
        const vfs = new(fsvfs.file)()
        vfs.once('sync', () => {
            vfs.getdir(__dirname, (err, files) => {
                t.deepEquals(err, undefined, 'no error')
                t.notEquals(files.length, 0, 'at least one file')
                t.end()
            })
        })
        vfs.init()
    })
    t.test('vfs-file / find', (t) => {
        const vfs = new(fsvfs.file)()
        vfs.once('sync', () => {
            vfs.find(Path.join(__dirname, '../lib'), (err, files) => {
                t.notOk(err, 'no error')
                t.equals(files.length, 5, '5 files')
                t.end()
            })
        })
        vfs.init()
    })
    t.end()
})
