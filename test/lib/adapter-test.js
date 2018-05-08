const tap = require('tap')
const Path = require('path')
const async = require('async')
const vfsFile = require('@kba/vfs-adapter-file')

const FIXTURE_DIR = process.env.FIXTURE_DIR ? process.env.FIXTURE_DIR : Path.join(__dirname, '..', 'fixtures')

const testFunctions = module.exports = {
    adapterReadTest(t, fs, cb) {
        const testFileContents = 'ÜÄ✓✗\n'
        const testFilePath = '/lib/file2.txt'
        fs.on('error', err => {
            console.error("ERROR", err)
            fs.end()
        })
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
            cb => t.test('getdir {sortBy: "mtime", sortDir: 1}', (t) => {
                fs.getdir('/lib', {sortBy: 'mtime', sortDir: 1}, (err, files) => {
                    t.equals(files[0].mtime.getTime() < files[2].mtime.getTime(), true, 'mtime: 0 < 2')
                    return cb(t.end())
                })
            }),
            cb => t.test('getdir {sortBy:mtime, sortDir: -1}', (t) => {
                fs.getdir('/lib', {sortBy: 'mtime', sortDir: -1}, (err, files) => {
                    t.equals(files[0].mtime.getTime() > files[2].mtime.getTime(), true, 'mtime: 0 > 2')
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
                fs.nextFile('/lib/file2.txt', {blacklistFn: f => f['%base'] === 'file3.png'}, (err, nextFile) => {
                    t.equals(nextFile.path, '/lib/file1', 'file2.txt -> file1')
                    return cb(t.end())
                })
            }),
            cb => t.test('find', (t) => {
                fs.find('/', (err, files) => {
                    t.notOk(err, 'no error')
                    t.ok(files.length >= 4, '>= 4 files in the fs')
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
            cb => {
                fs.end()
                cb()
            },
        ], cb))
        fs.init()
    },
  adapterWriteTest(t, fs, cb) {
    const testFileContents = 'ÜÄ✓✗\n'
    const testFilePath = '/lib/file2.txt'
    const tmpPath = '/tmp/foo'

    fs.on('error', err => {
      console.error("ERROR", err)
      fs.end()
    })
    fs.once('sync', () => async.waterfall([
      cb => t.test('writeFile', t => {
        fs.writeFile(testFilePath, testFileContents, (err) => {
          t.deepEquals(err, undefined, 'writeFile/String: no error')
          return cb(t.end())
        })
      }),
      cb => t.test('copyFile(string, {vfs:fs, path: tmpPath})', t => {
        fs.copyFile(testFilePath, {vfs: fs, path: tmpPath}, (err) => {
          if (err) console.log({err})
          t.notOk(err, 'no error')
          return cb(t.end())
        })
      }),
      cb => t.test('readFile/string', t => {
        fs.readFile(tmpPath, {encoding: 'utf8'}, (err, data) => {
          t.deepEquals(err, undefined, 'readFile/string: no error')
          t.equals(typeof data, 'string', 'is a string')
          t.equals(data.length, testFileContents.length, `${testFileContents.length} characters long`)
          return cb(t.end())
        })
      }),
      cb => t.test('unlink', t => {
        fs.unlink(tmpPath, (err) => {
          t.deepEquals(err, undefined, 'unlink: no error')
          fs.once('sync', () => cb(t.end()))
          fs.sync()
        })
      }),
      cb => t.test('stat after unlink', t => {
        fs.stat(tmpPath, (err, x) => {
          if (!err) console.log({err, x})
          t.ok(err.message.match('NoSuchFileError'), 'stat fails after delete')
          // t.equals(err.code, 'ENOENT', 'stat fails after delete')
          return cb(t.end())
        })
      }),
    ], cb))
    fs.init()
  }
}

testFunctions.testAdapter = function(adapterName, tests) {
    const fileAdapter = new vfsFile()
    tap.test(`${adapterName} adapter`, t => {
        const adapterClass = require(`@kba/vfs-adapter-${adapterName}`)
        t.equals(adapterClass.scheme, adapterName, `scheme is ${adapterName}`)
        const runTests = (options, fns, done) => {
          async.eachSeries(fns, (fn, fnDone) => {
                testFunctions[fn](t, new(adapterClass)(options), err => {
                    if (err) return fnDone(err)
                    return fnDone()
                })
          }, (err) => {
            if (err) return done(err)
            return done()
          })
        }
        async.eachSeries(tests, ([options, fns], done) => {
            if ('location' in options) {
                const fixtureName = Path.join(FIXTURE_DIR, options.location)
                fileAdapter.stat(fixtureName, (err, location) => {
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

