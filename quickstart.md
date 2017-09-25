# Installation

Always include `@kba/vfs` for implementation-independent functionality and the dispatcher.

```sh
npm install --save @kba/vfs
```

Then include the actual vfs implementations you need

```sh
npm install --save @kba/vfs-file
npm install --save @kba/vfs-zip
```

# Instantiating

VFS can be instantiated directly or using the dispatcher.

Using the dispatcher to instantiate VFS has the advantage that files/directories can be adressed by URL and VFS can be cached.

## Directly

```js
const VfsFile = require('@kba/vfs-file')
const vfs = new VfsFile({chroot: '/tmp'})
```

## Using the dispatcher

```js
const {dispatcher} = require('@kba/vfs')
dispatcher.enable(require('@kba/vfs-file')) // Enables file-URI and absolute paths
const vfs = dispatcher.instantiate('file', {chroot: '/tmp'})
```