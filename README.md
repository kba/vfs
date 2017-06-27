# vfs
> A virtual filesystem that works like [fs](http://nodejs.org/api/fs.html)

[![Build Status](https://travis-ci.org/kba/vfs.svg?branch=master)](https://travis-ci.org/kba/vfs)
[![CircleCI](https://circleci.com/gh/kba/vfs.svg?style=svg)](https://circleci.com/gh/kba/vfs)

<!-- BEGIN-MARKDOWN-TOC -->
* [Introduction](#introduction)
* [Currently implemented](#currently-implemented)
* [Creating a new VFS](#creating-a-new-vfs)
* [API](#api)
	* [vfs.base](#vfsbase)
		* [`(static) NODE_TYPES`](#static-node_types)
		* [`(static) capabilities`](#static-capabilities)
	* [vfs.api](#vfsapi)
		* [Constructor](#constructor)
		* [`use(pluginClass, pluginOptions)`](#usepluginclass-pluginoptions)
		* [`stat(path, options, callback)`](#statpath-options-callback)
		* [`mkdir(path, mode, callback)`](#mkdirpath-mode-callback)
		* [`init()`](#init)
		* [`sync(options)`](#syncoptions)
		* [`createReadStream(path, options)`](#createreadstreampath-options)
		* [`createWriteStream(path, options)`](#createwritestreampath-options)
		* [`readFile(path, options, callback)`](#readfilepath-options-callback)
		* [`writeFile(path, data, options, callback)`](#writefilepath-data-options-callback)
		* [`unlink(path, options, cb)`](#unlinkpath-options-cb)
		* [`mkdirRecursive(path, cb)`](#mkdirrecursivepath-cb)
		* [`copyFile(from, to, options, cb)`](#copyfilefrom-to-options-cb)
		* [`getdir(dir, options, callback)`](#getdirdir-options-callback)
		* [`find(path, callback)`](#findpath-callback)
		* [`du(path, callback)`](#dupath-callback)
		* [`readdir(path, options, callback)`](#readdirpath-options-callback)
		* [`nextFile(path, options, callback)`](#nextfilepath-options-callback)
		* [Events](#events)
			* [Events: `ready`](#events-ready)
			* [Events: `sync`](#events-sync)
	* [vfs.Node](#vfsnode)
		* [Constructor](#constructor-1)
		* [Properties](#properties)
			* [`vfs`](#vfs)
			* [`path`](#path)
			* [`mtime`](#mtime)
			* [`mode`](#mode)
			* [`mimetype`](#mimetype)
			* [`%root`](#root)
			* [`%dir`](#dir)
			* [`%base`](#base)
			* [`%ext`](#ext)
			* [`%name`](#name)
	* [CompressionUtils](#compressionutils)
		* [`(static) hasDecompressor(format)`](#static-hasdecompressorformat)
		* [`(static) getDecompressor(format)`](#static-getdecompressorformat)
	* [PathUtils](#pathutils)
		* [`(static) removeTrailingSep(path)`](#static-removetrailingseppath)
	* [StreamUtils](#streamutils)
		* [`(static) createReadableWrapper()`](#static-createreadablewrapper)
		* [`ReadableWrapper`](#readablewrapper)
			* [`wrapStream(stream)`](#wrapstreamstream)

<!-- END-MARKDOWN-TOC -->

## Introduction

A virtual file system is an interface to some data with the semantics of a file
system (directory hierarchy, files, metadata) and the mechanics of the [Node.JS
fs module](http://nodejs.org/api/fs.html).

## Currently implemented

* `file` - a VFS that mirrors the local filesystem
* `zip` - a VFS on top of ZIP content
* `tar` - a VFS on top of tarball content (compressions: gzip, bzip2, xz)

<!-- BEGIN-EVAL nodejs test/z.smoke.test.js|sed -e 's/\x1b.[0-9]*m//g' -e '1,3d' |head -n -4 -->
	                    zip  file tar  ar   
	stat                 ✓    ✓    ✓    ✓   
	mkdir                ✗    ✓    ✗    ✗   
	createReadStream     ✓    ✓    ✓    ✓   
	createWriteStream    ✗    ✓    ✗    ✗   
	readFile             ✓    ✓    ✓    ✓   
	writeFile            ✓    ✓    ✗    ✗   
	unlink               ✓    ✓    ✗    ✗   
	mkdirRecursive       ✗    ✓    ✗    ✗   
	copyFile             ✓    ✓    ✗    ✗   
	getdir               ✓    ✓    ✓    ✓   
	find                 ✓    ✓    ✓    ✓   
	du                   ✓    ✓    ✓    ✓   
	readdir              ✓    ✓    ✓    ✓   
	nextFile             ✗    ✗    ✗    ✗   

<!-- END-EVAL -->

## Creating a new VFS

* Subclass `vfs.base`
* Override
  * `_stat`
  * `_readdir`

## API

<!-- BEGIN-RENDER ./vfs/base.js -->
### vfs.base

Base class of all vfs

Provides default implementations for [some api methods](#vfsapi).

#### `(static) NODE_TYPES`

Types a [vfs.Node](#vfsnode) can have.

Currently:
 - `Directory`
 - `SymbolicLink`
#### `(static) capabilities`

Lists the capabilities of a VFS, i.e. which methods are available

- `@return {Set}` set of available methods

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./vfs/api.js -->
### vfs.api
Interface of all vfs
#### Constructor
#### `use(pluginClass, pluginOptions)`

Enable a plugin
#### `stat(path, options, callback)`

Get metadata about a node in the vfs.
- `@param {String} path` absolute path to the file
- `@param {Function} callback` error or {@link Node}
#### `mkdir(path, mode, callback)`

Create a directory

- `@param {string} path` absolute path to the folder
- `@param {errorCallback} cb`
- @see [fs#mkdir](https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback)
#### `init()`

Initialize the filesystem.

By default only calls #sync and emits [`ready`](#events-ready) on [`sync`](#events-sync)}
#### `sync(options)`

Sync the filesystem.
#### `createReadStream(path, options)`
See [fs.createReadStream](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)
Create a ReadableStream from a file
@param {string} path absolute path to the file
#### `createWriteStream(path, options)`

Create a WritableStream to a file

See [fs.createWriteStream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options).
@param {string} path absolute path to the file
@callback readFileCallback
@param {Error} err
@param {Buffer|String} data the file data as a buffer or stream
#### `readFile(path, options, callback)`

@see {@link https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback fs#readFile}

- `@param {string} path` absolute path to the file
- `@param {object} options`
- `@param {object} options.encoding=undefined` Encoding of the data. Setting this will return a String
- `@param {readFileCallback} cb`
#### `writeFile(path, data, options, callback)`

@see {@link https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback fs#writeFile}

- `@param {string} path` absolute path to the file
- `@param {object} options`
- `@param {function(err)}` cb
#### `unlink(path, options, cb)`

@param {string} path absolute path to the folder
@param {errorCallback} cb
@see {@link https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback fs#unlink}
#### `mkdirRecursive(path, cb)`

mkdir -p

@param {string} path absolute path to the folder to create
@param {errorCallback} cb
#### `copyFile(from, to, options, cb)`

Copy file, possibly across different VFS.

@param {string|Node} from
@param {string|Node} to
@param {errorCallback} cb
#### `getdir(dir, options, callback)`

Get directory contents as {@link Node} objects.
Essentially a shortcut for {@link api#stat} applied to {@link api#getdir}.
- @param {string} dir
- @param {object} options
  - @param {Node} options.parent=null
  - @param {string} options.sortBy=null
  - @param {number} options.sortDir=-1
- @return {function(err, nodes)} cb
#### `find(path, callback)`

List recursive folder contents
@param path string path
@param cb function (err, files)
#### `du(path, callback)`

Recursive size of a node.
@param {string} path absolute path to the file
#### `readdir(path, options, callback)`

List the nodes in a folder.
@see [fs#readdir](https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback).
- `@param {string} path` absolute path to the folder
- `@param {function(err, filenames)} callback`
  - `@param {Error} err`
  - `@param {array} filenames` list of relative path names in this folder
#### `nextFile(path, options, callback)`

Find the next file starting from path
- `@param {string} path` absolute path to the file
- `@param {object} options`
  - `@param {boolean} delta` Offset. Set to negative to get previous file. Default: +1
  - `@param {function(path)} whitelistFn` Consider only paths for which this fn returns true
  - `@param {function(path)} blacklistFn` Discard all paths for which this fn returns true
  - `@param {String} wrapStrategy` What to do when hitting a directory boundary
     - `throw` Throw an error when files are exhausted
     - `wrap` Jump from beginning to end / vice versa (Default)
     - `jump` Jump to first file in next folder / last file in previous folder
- `@param {function(err, nextPath)} callback`
  - `@param {Error} err`
  - `@param {array} filenames` list of relative path names in this folder
#### Events
##### Events: `ready`
##### Events: `sync`

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./vfs/node.js -->
### vfs.Node
```js
new fsvfs.Node({path: "/...", vfs: vfsInstance})
```

Class representing file metadata
#### Constructor
- `@param {object} options` Options that will be passed
- `@param {string} options.path` Absolute path to the node
- `@param {fsvfs} options.vfs` Instance of a {@link fsvfs}

#### Properties
##### `vfs`
Parent vfs instance, e.g. a [file](./vfs-file)
##### `path`
Absolute, normalized path of the node within the vfs
##### `mtime`
Date of last modification
##### `mode`
##### `mimetype`
MIME type of this node
##### `%root`
See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
##### `%dir`
See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
##### `%base`
See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
##### `%ext`
See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)
##### `%name`
See [path.parse(path)](https://nodejs.org/api/path.html#path_path_parse_path)

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./vfs-util-compression/util-compression.js -->
### CompressionUtils
#### `(static) hasDecompressor(format)`

Whether a decompression format is supported
#### `(static) getDecompressor(format)`

Instantiate a decompression stream
@memberof util

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./vfs-util-path/util-path.js -->
### PathUtils
Enhancing [path](https://nodejs.org/api/path.html)
```js
const PathUtils = require('@kba/vfs-util-path')
PathUtils.removeTrailingSep('/foo/') // '/foo'
// or
const {removeTrailingSep} = require('@kba/vfs-util-path')
removeTrailingSep('/foo/') // '/foo'
```
#### `(static) removeTrailingSep(path)`

Remove trailing separators (slashes) from `path`.

<!-- END-RENDER -->

<!-- BEGIN-RENDER ./vfs-util-stream/util-stream.js -->
### StreamUtils
#### `(static) createReadableWrapper()`
Wraps another ReadableStream to allow synchronously returning a stream
that will become readable only later.
```js
const {createReadableWrapper} = require('@kba/vfs-util-stream')
const readable = createReadableWrapper()
// TODO, see vfs-tar
```
#### `ReadableWrapper`
TODO
##### `wrapStream(stream)`
TODO

<!-- END-RENDER -->
