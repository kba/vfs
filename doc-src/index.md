# vfs documentation

## Options

### `parseQueryString`

Whether to parse URL query param (`?...`)

### `slashesDenoteHost`

Whether first URL path segment is the host

### `cwd`

Current working directory

## Glossary

```
   URL --> Dispatcher
              |
              v
          VFS Cache
              |
              v
             VFS --> VFS Node
```

### URL

URL are parsed with Node.js' [url](https://nodejs.org/api/url.html) module, the
positional options to
[`url.parse`](https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost)
can be provided as options.

```js
dispatcher.parseUrl('sftp:///?q=xs', {
  slashesDenoteHost: true,
  parseQueryString: false
})
```

### Dispatcher

The dispatcher instantiates VFS Nodes from URL and caches VFS instances for
better performance.

To register a protocol, use `dispatcher.user`:

VFS is determined by the URL `protocol`.

```js
const fileVfs = require('@kba/vfs-adapter-file')
dispatcher.parseUrl('file:///tmp/test') // throws 'UnsupportedFormatError'
dispatcher.use('file', fileVfs)
dispatcher.parseUrl('file:///tmp/test') // returns a VFS.Node
```

### VFS Cache

TODO

### VFS Node

TODO

### VFS

TODO
