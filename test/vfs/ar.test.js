const {testVfs} = require('../lib/vfs-test')

testVfs('ar', [
    [{location: 'folder.a'}, ['vfsReadTest']]
])

