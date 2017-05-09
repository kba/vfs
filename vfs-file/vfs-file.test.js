const Path = require('path')
const {vfsReadTest, testVfs} = require('@kba/vfs-test')

const vfsFile = new(require('.'))({chroot: Path.join(
    __dirname,
    '..',
    'test',
    'fixtures'
)})
testVfs(
    require('./vfs-file'),
    vfsFile,
    'file',
    [
        [{chroot: Path.join(__dirname, '/../test/fixtures/folder')}, [vfsReadTest]]
    ]
)
