const tap = require('tap')
const async = require('async')
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

function testZip(t, location, cb) {
    const zipfs = new fsvfs.zip({location})
    const dummyData = 'ÜÄ✓'
    const dummyPath = '/bar.foo'
    zipfs.once('sync', () => async.waterfall([
        cb => t.test('getdir', (t) => {
            zipfs.getdir('/lib', (err, files) => {
                t.equals(files.length, 3, '3 files in /lib')
                t.end()
                return cb()
            })
        }),
        cb => t.test('find', (t) => {
            zipfs.find('/', (err, files) => {
                t.notOk(err, 'no error')
                t.equals(files.length, 4, '4 files in the ZIP')
                t.end()
                return cb()
            })
        }),
        cb => t.test('writeFile', t => {
            zipfs.writeFile(dummyPath, dummyData, (err) => {
                t.deepEquals(err, undefined, 'writeFile/String: no error')
                t.end()
                return cb()
            })
        }),
        cb => t.test('readFile/ArrayBuffer', t => {
            zipfs.readFile(dummyPath, (err, data) => {
                t.deepEquals(err, undefined, 'no error')
                t.ok(data instanceof ArrayBuffer, 'is an arraybuffer')
                t.equals(data.byteLength, 7, `7 bytes long`)
                t.end()
                return cb()
            })
        }),
        cb => t.test('readFile/string', t => {
            zipfs.readFile(dummyPath, {encoding: 'utf8'}, (err, data) => {
                t.deepEquals(err, undefined, 'readFile/string: no error')
                t.equals(typeof data, 'string', 'is a string')
                t.equals(data.length, dummyData.length, `${dummyData.length} characters long`)
                t.end()
                return cb()
            })
        }),
        cb => t.test('copyFile(string, {vfs:fs, path: /tmp/foo})', t => {
            zipfs.copyFile(dummyPath, {vfs: fs, path: '/tmp/foo'}, (err) => {
                t.notOk(err, 'no error')
                t.end()
                return cb()
            })
        }),
        cb => t.test('unlink', t => {
            zipfs.unlink(dummyPath, (err) => {
                t.deepEquals(err, undefined, 'unlink: no error')
                t.end()
                return cb()
            })
        }),
        cb => t.test('stat after unlink', t => {
            zipfs.stat(dummyPath, (err, x) => {
                t.ok(err.message.match('NoSuchFileError'), 'stat fails after delete')
                t.end()
                return cb()
            })
        }),
    ], cb))
    zipfs.init()
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
