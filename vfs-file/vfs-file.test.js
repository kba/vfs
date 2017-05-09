const Path = require('path')
const {vfsReadTest, testVfs} = require('@kba/vfs-test')

testVfs(
    require('./vfs-file'),
    'file',
    [
        [{chroot: Path.join(__dirname, '/../test/fixtures/folder')}, [vfsReadTest]]
    ]
)
