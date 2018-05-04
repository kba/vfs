const sftpAdapter = require('@kba/vfs-adapter-sftp')
const zipAdapter = require('@kba/vfs-adapter-zip')
const sftp = new sftpAdapter({
  sshOptions: {
    host: '127.0.0.1',
    port: '22',
    username: process.env.USER,
    privateKey: require('fs').readFileSync(`${process.env.HOME}/.ssh/id_rsa`)
  }
})
const location = sftp.stat('/path/to/file.zip')
const zip = new zipAdapter({location})
const is = zip.createReadStream()
