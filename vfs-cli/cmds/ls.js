const dispatcher = require('@kba/vfs')
require('@kba/vfs-all-adapters').enableAll(dispatcher)

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
    const vfs = dispatcher.instantiate(url).promisify()
    vfs.stat('/').then(stat => console.log("Node", {stat}))
  }
}
