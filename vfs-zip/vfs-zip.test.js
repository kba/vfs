const {vfsReadTest, testVfs} = require('@kba/vfs-test')

testVfs(
    require('./vfs-zip'),
    'zip',
    [
        [{location: 'folder.zip'}, [vfsReadTest]]
    ]
)
