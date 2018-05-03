const dispatcher = require('@kba/vfs')
require('@kba/vfs-all-adapters').enableAll(dispatcher)

module.exports = {
  command: 'ls <location>',
  desc: 'ls(1) a vfs node',
  builder(argv) {
    argv
      .option('long', {
        alias: ['l'],
      })
  },
  handler(argv) {
    const {location} = argv
    const {path} = dispatcher.parseUrl(location, {slashesDenotesHost: false})
    const vfs = dispatcher.instantiate('/').promisify()
    let ret = ''
    const doit = async () => {
      const node = await vfs.stat(path)
      if (node.isDirectory) {
        const contents = await vfs.getdir(path)
        console.log(contents)
        contents.forEach(f => ret += f['%base'])
      } else {
        ret += node['%base']
      }
      console.log(ret)
      // console.log("Node", {node})
      // console.log(node.vfs)
    }
    doit()
  }
}
