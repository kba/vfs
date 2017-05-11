const {testVfs} = require('../lib/vfs-test')

testVfs('zip', [
    [{location: 'folder.zip'}, ['vfsReadTest']]
])
