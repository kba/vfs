const {testAdapter} = require('../lib/adapter-test')

testAdapter('tar', [
    [{location: 'folder.tar'}, ['adapterReadTest']],
    // [{location: 'folder.tar.gz', compression: 'gzip'}, ['adapterReadTest']],
    // [{location: 'folder.tar.bz2', compression: 'bzip2'}, ['adapterReadTest']],
    // [{location: 'folder.tar.xz', compression: 'xz'}, ['adapterReadTest']],
])
