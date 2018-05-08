const {testAdapter} = require('../lib/adapter-test')

testAdapter('zip', [
    [{location: 'folder.zip'}, ['adapterReadTest', 'adapterWriteTest']]
])
