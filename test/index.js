const tap = require('tap')
const Path = require('path')
const async = require('async')
const vfsFile = require('@kba/vfs-file')
const testFunctions = require('./vfs.test')

const vfsTests = {
    'file': [
        [{chroot: Path.join(__dirname, 'fixtures/folder')}, ['vfsReadTest']]
    ],
    'tar': [
        [{location: 'folder.tar'}, ['vfsReadTest']],
        [{location: 'folder.tar.gz', compression: 'gzip'}, ['vfsReadTest']],
        [{location: 'folder.tar.bz2', compression: 'bzip2'}, ['vfsReadTest']],
        [{location: 'folder.tar.xz', compression: 'xz'}, ['vfsReadTest']],
    ],
    'zip': [
        [{location: 'folder.zip'}, ['vfsReadTest']]
    ]
}

Object.keys(vfsTests).forEach(vfsName => {
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
        async.eachSeries(vfsTests[vfsName], ([options, fns], done) => {
            if ('location' in options) {
                const fixtureName = Path.join(__dirname, 'fixtures', options.location)
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
})
