# vfs documentation

## Dispatcher

The dispatcher instantiates VFS instances from URL and caches instances for better performance.

URL are parsed with Node.js' [url](https://nodejs.org/api/url.html) module, the
positional options to
[`url.parse`](https://nodejs.org/api/url.html#url_url_parse_urlstring_parsequerystring_slashesdenotehost)
can be provided as options.

```js
dispatcher.parseUrl('sftp:///?q=xs', {slashesDenoteHost: true, parseQueryString: false})
```
