const async = require('async')

module.exports = {
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
                stream.on('data', (data) => t.equals(data.toString(), testFileContents))
                stream.on('end', () => {
                    t.end()
                    return cb()
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


