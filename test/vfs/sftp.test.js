const Path = require('path')
const {testVfs} = require('../lib/vfs-test')

testVfs('sftp', [
    [{
        chroot: Path.resolve(__dirname+'/../fixtures/folder'),
        sshOptions: {
            host: '127.0.0.1',
            port: '22',
            username: 'kb',
            privateKey: require('fs').readFileSync(`${process.env.HOME}/.ssh/id_rsa`)
        }
    }, ['vfsReadTest']]
])

