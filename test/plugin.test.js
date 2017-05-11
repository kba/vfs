const tap = require('tap')
const vfsFile = require('@kba/vfs-file')

class TestPlugin {

    stat(node, cb) {
        node.foo = '42'
        cb()
    }

}

tap.test('plugin loading', t => {
    const vfs = new vfsFile({chroot: __dirname + '/fixtures'})
    vfs.use(TestPlugin, {})
    t.equals(vfs.plugins.length, 1, 'one plugin loaded')
    vfs.stat('/', (err, node) => {
        t.deepEquals(err, undefined, 'no error')
        t.equals(node.foo, '42', 'test plugin worked')
        t.end()
    })
})

