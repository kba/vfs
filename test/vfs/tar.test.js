const {testVfs} = require('../lib/vfs-test')

testVfs('tar', [
    [{location: 'folder.tar'}, ['vfsReadTest']],
    // [{location: 'folder.tar.gz', compression: 'gzip'}, ['vfsReadTest']],
    // [{location: 'folder.tar.bz2', compression: 'bzip2'}, ['vfsReadTest']],
    // [{location: 'folder.tar.xz', compression: 'xz'}, ['vfsReadTest']],
])
