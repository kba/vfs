const Path = require('path')
const {testVfs} = require('../lib/vfs-test')

testVfs('file', [
    [{chroot: Path.resolve(__dirname+'/../fixtures/folder')}, ['vfsReadTest']]
])

