const tap = require('tap')
const Path = require('path')
const async = require('async')
const vfs = require('../lib')

const vfsTests = {
    'file': [
        [{chroot: Path.join(__dirname, 'fixtures/folder')}, ['vfsReadTest']]
    ],
    'tar': [
        [{location: 'folder.tar'}, ['vfsReadTest']]
    ],
    'zip': [
        [{location: 'folder.zip'}, ['vfsReadTest']]
    ]
}
const testFunctions = {
    vfsReadTest: function (t, fs, cb) {
        const testFilePath = '/lib/file2.txt'
        fs.once('sync', () => async.waterfall([
            cb => t.test('stat', t => {
                t.equals(fs.constructor.capabilities.has('stat'), true, 'implements stat')
                fs.stat(testFilePath, (err, node) => {
                    t.deepEquals(err, undefined, 'no error')
                    t.equals(node.size, 11, '11 bytes long')
                    t.equals(node.isDirectory, false, 'not a Directory')
                    t.end()
                    return cb()
                })
            }),
            cb => t.test('readdir', (t) => {
                fs.readdir('/lib', (err, files) => {
                    t.equals(files.length, 3, '3 files in /lib')
                    t.end()
                    return cb()
                })
            }),
            cb => t.test('getdir', (t) => {
                fs.getdir('/lib', (err, files) => {
                    t.equals(files.length, 3, '3 files in /lib')
                    t.end()
                    return cb()
                })
            }),
            cb => t.test('find', (t) => {
                fs.find('/', (err, files) => {
                    t.notOk(err, 'no error')
                    t.equals(files.length, 4, '4 files in the fs')
                    t.end()
                    return cb()
                })
            }),
            cb => t.test('createReadStream', t =>{
                if (!(fs.constructor.capabilities.has('createReadStream'))) {
                    t.comment('Not implemented')
                    t.end()
                    return cb()
                }
                const stream = fs.createReadStream(testFilePath)
                stream.on('data', (data) => t.equals(data.toString(), 'ÜÄ✓✗\n'))
                stream.on('end', () => {
                    t.end()
                    return cb()
                })
            }),
            cb => t.test('readFile', t => {
                fs.readFile(testFilePath, (err, buf) => {
                    t.deepEquals(err, undefined, 'no error')
                    t.equals(buf.toString(), 'ÜÄ✓✗\n')
                    t.end()
                    return cb()
                })
            }),
            cb => cb(),
            // cb => t.test('writeFile', t => {
            //     vfs.writeFile(dummyPath, dummyData, (err) => {
            //         t.deepEquals(err, undefined, 'writeFile/String: no error')
            //         t.end()
            //         return cb()
            //     })
            // }),
            // cb => t.test('readFile/ArrayBuffer', t => {
            //     vfs.readFile(dummyPath, (err, data) => {
            //         t.deepEquals(err, undefined, 'no error')
            //         t.ok(data instanceof ArrayBuffer, 'is an arraybuffer')
            //         t.equals(data.byteLength, 7, `7 bytes long`)
            //         t.end()
            //         return cb()
            //     })
            // }),
            // cb => t.test('readFile/string', t => {
            //     vfs.readFile(dummyPath, {encoding: 'utf8'}, (err, data) => {
            //         t.deepEquals(err, undefined, 'readFile/string: no error')
            //         t.equals(typeof data, 'string', 'is a string')
            //         t.equals(data.length, dummyData.length, `${dummyData.length} characters long`)
            //         t.end()
            //         return cb()
            //     })
            // }),
            // cb => t.test('copyFile(string, {vfs:fs, path: /tmp/foo})', t => {
            //     vfs.copyFile(dummyPath, {vfs: fs, path: '/tmp/foo'}, (err) => {
            //         t.notOk(err, 'no error')
            //         t.end()
            //         return cb()
            //     })
            // }),
            // cb => t.test('unlink', t => {
            //     vfs.unlink(dummyPath, (err) => {
            //         t.deepEquals(err, undefined, 'unlink: no error')
            //         t.end()
            //         return cb()
            //     })
            // }),
            // cb => t.test('stat after unlink', t => {
            //     vfs.stat(dummyPath, (err, x) => {
            //         t.ok(err.message.match('NoSuchFileError'), 'stat fails after delete')
            //         t.end()
            //         return cb()
            //     })
            // }),
        ], cb))
        fs.init()
    }
}

Object.keys(vfsTests).forEach(vfsName => {
    const fileVfs = new(vfs.file)()
    tap.test(`${vfsName} vfs`, t => {
        const vfsClass = vfs[vfsName]
        t.equals(vfsClass.scheme, vfsName, `scheme is ${vfsName}`)
        const runTests = (options, fns) => {
            fns.forEach(fn => {
                testFunctions[fn](t, new(vfs[vfsName])(options), err => {
                    if (err) throw(err)
                    t.end()
                })
            })
        }
        vfsTests[vfsName].forEach(([options, fns]) => {
            if ('location' in options) {
                const fixtureName = Path.join(__dirname, 'fixtures', options.location)
                fileVfs.stat(fixtureName, (err, location) => {
                    if (err) throw err
                    t.notOk(err, `read ${fixtureName}`)
                    options.location = location
                    runTests(options, fns)
                })
            } else {
                runTests(options, fns)
            }
        })
    })
})
