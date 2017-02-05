# vfs
A virtual filesystem that works like [fs](http://nodejs.org/api/fs.html)

[![Build Status](https://travis-ci.org/kba/fsvfs.svg?branch=master)](https://travis-ci.org/kba/fsvfs)

## Currently implemented

* `file` - a VFS that mirrors the local filesystem
* `zip` - a VFS on top of ZIP content
* `tar` - a VFS on top of tarball content (compressions: gzip, bzip2, xz)
