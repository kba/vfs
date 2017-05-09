const Path = require('path')
const {vfsReadTest, testVfs} = require('@kba/vfs-test')

const vfsFile = new(require('@kba/vfs-file'))({chroot: Path.join(
    __dirname,
    '..',
    'test',
    'fixtures'
)})
testVfs(
    require('./vfs-zip'),
    vfsFile,
    'zip',
    [
        [{location: 'folder.zip'}, [vfsReadTest]]
    ]
)
