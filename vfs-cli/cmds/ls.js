const vfs = require('@kba/vfs')
require('@kba/vfs-all').enableAll(vfs)

module.exports = {
  command: 'ls <url>',
  desc: 'ls(1) a vfs node',
  builder(argv) {
    argv
      .option('long', {
        alias: ['l'],
      })
  },
  handler(argv) {
    const {url} = argv
    const node = vfs.parseUrl(url)
    console.log("Node", [node, node.vfs])
  }
}
