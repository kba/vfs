# Plugins

## CLI Plugins

To add a command to `vfs`:

1) Install a symlink `$PREFIX/share/vfs/vfs-name-of-command.js` that points to
   the real location (which can itself be a symlink)

## Vfs Plugins

Plugins can extend the functionality of a vfs by using hooks provided by the vfs.

### Instantiation

Plugins can be registered with a vfs by calling its `use` method:

```js
vfs.use(pluginClass, pluginOptions)
```

Plugins can also be provided as options to the constructor of a vfs:

```js
const vfs = new vfs.file({plugins: [
  [pluginClass, pluginOptions]
]}
```

### Hooks

To hook into a vfs method, a plugin must provide a function `before_<method>` or `after_<method>`.

The `before_<method>` method takes the same arguments as `<method>`.

The `after_<method>` receives the result of the call to `<method>`.

#### after_stat
