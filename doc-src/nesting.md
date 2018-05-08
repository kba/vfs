# Nested VFS

File systems are hierarchical and VFS can be nested.

## Examples

Imagine you wanted to read a file in an archive on a remote server:

```
URL: zip:sftp://server/path/to/file.zip!/path/within/zip/target

sftp://server/path/to/file.zip -> zip:///path/within/zip/target
```

Or a ZIP within a ZIP on an SFTP:

```
zip:zip:sftp://server/path/to/file.zip!/path/within/zip/target.zip!/path/within/inner/zip

sftp://server/path/to/file.zip -> zip:///path/within/zip/target.zip -> zip:/path/within/inner/zip
```

## Programmatically

Programmatically you can first instantiate the `sftp` VFS.Node and create a
`zip` VFS.Node based on that:

```js
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
const is = zip.createReadStream('/path/within/zip/target')
```

## URL notation

```pest
   URL = protocols + '://' + paths
   protocols := 
```



