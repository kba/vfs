## Plugins

Plugins can extend the functionality of a vfs by using hooks provided by the vfs.

### Instantiation

Plugins can be registered with a vfs by calling its `use` method:

```js
vfs.use(pluginClass, pluginOptions)
```

### Hooks

To hook into a vfs method, a plugin must provide a function `before_<method>` or `after_<method>`.

The `before_<method>` method takes the same arguments as `<method>`.

The `after_<method>` receives the result of the call to `<method>`.

