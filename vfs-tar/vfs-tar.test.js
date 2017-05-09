const Path = require('path')
const {vfsReadTest, testVfs} = require('@kba/vfs-test')

const vfsFile = new(require('@kba/vfs-file'))({chroot: Path.join(
    __dirname,
    '..',
    'test',
    'fixtures'
)})
testVfs(
    require('./vfs-tar'),
    vfsFile,
    'tar',
    [
        [{location: 'folder.tar'}, [vfsReadTest]],
        [{location: 'folder.tar.gz', compression: 'gzip'}, [vfsReadTest]],
        [{location: 'folder.tar.bz2', compression: 'bzip2'}, [vfsReadTest]],
        [{location: 'folder.tar.xz', compression: 'xz'}, [vfsReadTest]],
    ]
)
