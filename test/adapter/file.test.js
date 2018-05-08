const Path = require('path')
const {testAdapter} = require('../lib/adapter-test')

testAdapter('file', [
    [{chroot: Path.resolve(__dirname+'/../fixtures/folder')}, ['adapterReadTest', 'adapterWriteTest']]
])

