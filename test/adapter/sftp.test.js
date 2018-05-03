const Path = require('path')
const {testAdapter} = require('../lib/adapter-test')

if (process.env.ENABLE_SFTP_TESTS !== 'true' && process.env.USER !== 'kba') {
  console.warn("Skipping SFTP test since ENABLE_SFTP_TESTS is not set in env and USER is not 'kba'")
} else {
  testAdapter('sftp', [
    [{
      chroot: Path.resolve(__dirname+'/../fixtures/folder'),
      sshOptions: {
        host: '127.0.0.1',
        port: '22',
        username: process.env.USER,
        privateKey: require('fs').readFileSync(`${process.env.HOME}/.ssh/id_rsa`)
      }
    }, ['adapterReadTest']]
  ])
}
