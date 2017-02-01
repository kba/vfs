const tap = require('tap')
const async = require('async')
const fsvfs = require('../lib')
const fs = new(fsvfs.file)()
const Path = require('path')

function testZip(t, location, cb) {
    const zipvfs = new fsvfs.zip({location})
    const dummyData = 'ÜÄ✓'
    const dummyPath = '/bar.foo'
    zipvfs.once('sync', () => async.waterfall([
        cb => t.test('getdir', (t) => {
            zipvfs.getdir('/lib', (err, files) => {
                t.equals(files.length, 3, '3 files in /lib')
                t.end()
                return cb()
            })
        }),
        cb => t.test('find', (t) => {
            zipvfs.find('/', (err, files) => {
                t.notOk(err, 'no error')
                t.equals(files.length, 4, '4 files in the ZIP')
                t.end()
                return cb()
            })
        }),
        cb => t.test('writeFile', t => {
            zipvfs.writeFile(dummyPath, dummyData, (err) => {
                t.deepEquals(err, undefined, 'writeFile/String: no error')
                t.end()
                return cb()
            })
        }),
        cb => t.test('readFile/ArrayBuffer', t => {
            zipvfs.readFile(dummyPath, (err, data) => {
                t.deepEquals(err, undefined, 'no error')
                t.ok(data instanceof ArrayBuffer, 'is an arraybuffer')
                t.equals(data.byteLength, 7, `7 bytes long`)
                t.end()
                return cb()
            })
        }),
        cb => t.test('readFile/string', t => {
            zipvfs.readFile(dummyPath, {encoding: 'utf8'}, (err, data) => {
                t.deepEquals(err, undefined, 'readFile/string: no error')
                t.equals(typeof data, 'string', 'is a string')
                t.equals(data.length, dummyData.length, `${dummyData.length} characters long`)
                t.end()
                return cb()
            })
        }),
        cb => t.test('copyFile(string, {vfs:fs, path: /tmp/foo})', t => {
            zipvfs.copyFile(dummyPath, {vfs: fs, path: '/tmp/foo'}, (err) => {
                t.notOk(err, 'no error')
                t.end()
                return cb()
            })
        }),
        cb => t.test('unlink', t => {
            zipvfs.unlink(dummyPath, (err) => {
                t.deepEquals(err, undefined, 'unlink: no error')
                t.end()
                return cb()
            })
        }),
        cb => t.test('stat after unlink', t => {
            zipvfs.stat(dummyPath, (err, x) => {
                t.ok(err.message.match('NoSuchFileError'), 'stat fails after delete')
                t.end()
                return cb()
            })
        }),
    ], cb))
    zipvfs.init()
}

tap.test('vfs-zip', (t) => {
    const zipPath = Path.join(__dirname, 'fixtures/zip-folder.zip')
    fs.stat(zipPath, (err, location) => {
        t.notOk(err, "Read ZIP file okay")
        t.equals(fsvfs.zip.scheme, 'zip', 'scheme is right')
        testZip(t, location, (err) => {
            t.end()
        })
    })
})
