const tap = require('tap')
const Path = require('path')
const async = require('async')
const vfsFile = require('@kba/vfs-file')

const testFunctions = module.exports = {
    vfsReadTest(t, fs, cb) {
        const testFileContents = 'ÜÄ✓✗\n'
        const testFilePath = '/lib/file2.txt'
        fs.once('sync', () => async.waterfall([
            cb => t.test('stat', t => {
                t.equals(fs.constructor.capabilities.has('stat'), true, 'implements stat')
                fs.stat(testFilePath, (err, node) => {
                    t.deepEquals(err, undefined, 'no error')
                    t.equals(node.size, 11, '11 bytes long')
                    t.equals(node.isDirectory, false, 'not a Directory')
                    return cb(t.end())
                })
            }),
            cb => t.test('readdir', (t) => {
                fs.readdir('/lib', (err, files) => {
                    t.equals(files.length, 3, '3 files in /lib')
                    return cb(t.end())
                })
            }),
            cb => t.test('getdir', (t) => {
                fs.getdir('/lib', (err, files) => {
                    t.equals(files.length, 3, '3 files in /lib')
                    return cb(t.end())
                })
            }),
            cb => t.test('getdir {sortBy:mtime, sortDir: 1}', (t) => {
                fs.getdir('/lib', {sortBy: 'mtime', sortDir: 1}, (err, files) => {
                    t.equals(files[0].mtime.getTime() < files[2].mtime.getTime(), true, '0 < 2')
                    return cb(t.end())
                })
            }),
            cb => t.test('getdir {sortBy:mtime, sortDir: -1}', (t) => {
                fs.getdir('/lib', {sortBy: 'mtime', sortDir: -1}, (err, files) => {
                    t.equals(files[0].mtime.getTime() > files[2].mtime.getTime(), true, '0 > 2')
                    return cb(t.end())
                })
            }),
            cb => t.test('nextFile', t => {
                fs.nextFile('/lib/file1', (err, nextFile) => {
                    t.equals(nextFile.path, '/lib/file2.txt', 'file1 -> file2.txt')
                    return cb(t.end())
                })
            }),
            cb => t.test('nextFile', t => {
                fs.nextFile('/lib/file3.png', (err, nextFile) => {
                    t.equals(nextFile.path, '/lib/file1', 'file3.png -> file1')
                    return cb(t.end())
                })
            }),
            cb => t.test('nextFile {delta: -1}', t => {
                fs.nextFile('/lib/file1', {delta: -1}, (err, nextFile) => {
                    t.equals(nextFile.path, '/lib/file3.png', 'file1 -> file3.png')
                    return cb(t.end())
                })
            }),
            cb => t.test('nextFile {blacklistFn}', t => {
                fs.nextFile('/lib/file2.txt', {blacklistFn: f => f['%base'] !== 'file3.png'}, (err, nextFile) => {
                    t.equals(nextFile.path, '/lib/file1', 'file2.txt -> file1')
                    return cb(t.end())
                })
            }),
            cb => t.test('find', (t) => {
                fs.find('/', (err, files) => {
                    t.notOk(err, 'no error')
                    t.equals(files.length, 4, '4 files in the fs')
                    return cb(t.end())
                })
            }),
            cb => t.test('createReadStream', t =>{
                if (!(fs.constructor.capabilities.has('createReadStream'))) {
                    t.comment('Not implemented')
                    return cb(t.end())
                }
                const stream = fs.createReadStream(testFilePath)
                stream.on('data', (data) => t.equals(data.toString(), testFileContents))
                stream.on('end', () => {
                    return cb(t.end())
                })
            }),
            cb => t.test('readFile/string', t => {
                fs.readFile(testFilePath, {encoding:'utf8'}, (err, buf) => {
                    t.deepEquals(err, undefined, 'no error')
                    t.equals(buf, testFileContents)
                    t.end()
                    return cb()
                })
            }),
            cb => t.test('readFile/Buffer', t => {
                fs.readFile(testFilePath, (err, buf) => {
                    t.deepEquals(err, undefined, 'no error')
                    t.deepEquals(buf, new Buffer(testFileContents))
                    return cb(t.end())
                })
            }),
            cb => cb(),
            // cb => t.test('writeFile', t => {
            //     vfs.writeFile(dummyPath, dummyData, (err) => {
            //         t.deepEquals(err, undefined, 'writeFile/String: no error')
            //         return cb(t.end())
            //     })
            // }),
            // cb => t.test('readFile/string', t => {
            //     vfs.readFile(dummyPath, {encoding: 'utf8'}, (err, data) => {
            //         t.deepEquals(err, undefined, 'readFile/string: no error')
            //         t.equals(typeof data, 'string', 'is a string')
            //         t.equals(data.length, dummyData.length, `${dummyData.length} characters long`)
            //         return cb(t.end())
            //     })
            // }),
            // cb => t.test('copyFile(string, {vfs:fs, path: /tmp/foo})', t => {
            //     vfs.copyFile(dummyPath, {vfs: fs, path: '/tmp/foo'}, (err) => {
            //         t.notOk(err, 'no error')
            //         return cb(t.end())
            //     })
            // }),
            // cb => t.test('unlink', t => {
            //     vfs.unlink(dummyPath, (err) => {
            //         t.deepEquals(err, undefined, 'unlink: no error')
            //         return cb(t.end())
            //     })
            // }),
            // cb => t.test('stat after unlink', t => {
            //     vfs.stat(dummyPath, (err, x) => {
            //         t.ok(err.message.match('NoSuchFileError'), 'stat fails after delete')
            //         return cb(t.end())
            //     })
            // }),
        ], cb))
        fs.init()
    }
}

testFunctions.testVfs = function(vfsName, tests) {
    const fileVfs = new vfsFile()
    tap.test(`${vfsName} vfs`, t => {
        const vfsClass = require(`@kba/vfs-${vfsName}`)
        t.equals(vfsClass.scheme, vfsName, `scheme is ${vfsName}`)
        const runTests = (options, fns, done) => {
            fns.forEach(fn => {
                testFunctions[fn](t, new(vfsClass)(options), err => {
                    if (err) return done(err)
                    return done()
                })
            })
        }
        async.eachSeries(tests, ([options, fns], done) => {
            if ('location' in options) {
                const fixtureName = Path.join(__dirname, '..', 'fixtures', options.location)
                fileVfs.stat(fixtureName, (err, location) => {
                    if (err) throw err
                    t.notOk(err, `read ${fixtureName}`)
                    options.location = location
                    runTests(options, fns, done)
                })
            } else {
                runTests(options, fns, done)
            }
        }, (err) => {
            if (err) t.fail(":-(")
            t.end()
        })
    })
}

