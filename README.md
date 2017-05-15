# vfs
> A virtual filesystem that works like [fs](http://nodejs.org/api/fs.html)

[![Build Status](https://travis-ci.org/kba/vfs.svg?branch=master)](https://travis-ci.org/kba/vfs)
[![CircleCI](https://circleci.com/gh/kba/vfs.svg?style=svg)](https://circleci.com/gh/kba/vfs)

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

<!-- END-EVAL -->

## Creating a new VFS

* Subclass `vfs.base`
* Override
  * `_stat`
  * `_readdir`
