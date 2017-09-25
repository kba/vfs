# Plugins

Plugin make a VFS extensible by providing hooks to change or augment standard
behavior.

## Examples

* [mimetype](https://github.com/kba/vfs/vfs-plugin-mimetype) Adds a `mimetype` field to every node

## Hooks

Currently only the `stat` method can be hooked into.
