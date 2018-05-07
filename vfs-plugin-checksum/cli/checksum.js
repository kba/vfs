// console.log(require)
const dispatcher = require('@kba/vfs')
require('@kba/vfs-all-adapters').enableAll(dispatcher)

module.exports = {
  command: 'test1 <location>',
  aliases: ['tac'],
  desc: 'cat(1) a vfs node',
  handler(argv) {
    const {location} = argv
    const {path} = dispatcher.parseUrl(location, {slashesDenotesHost: false})
    const vfs = dispatcher.instantiate('/')
    vfs.createReadStream(path).pipe(process.stdout)
  }
}
