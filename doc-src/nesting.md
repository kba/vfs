## Nested VFS

File systems are hierarchical and VFS can be nested.

### Example

Imagine you wanted to read a file in an archive on a remote server:

```
sftp://server/path/to/file.zip

      zip:///path/within/zip/target
```

Programmatically you can first instantiate the `sftp` VFS.Node and create a
`zip` VFS.Node based on that:

```js
const sftpAdapter = require('@kba/vfs-adapter-sftp')
const zipAdapter = require('@kba/vfs-adapter-zip')
const sftpVfs = 
```


