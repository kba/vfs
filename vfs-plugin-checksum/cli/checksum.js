// console.log(require)
const dispatcher = require('@kba/vfs')
require('@kba/vfs-all-adapters').enableAll(dispatcher)
const Checksummer = require('../checksummer')

module.exports = {
  command: 'checksum <location>',
  aliases: ['hash'],
  desc: 'checksum a vfs node',
  builder(yargs) {
    yargs.option('algo', {
      alias: ['a'],
      desc: 'Algorithm to use',
      default: 'sha512',
    }),
    yargs.option('maxlen', {
      alias: ['m'],
      desc: 'Checksum at most these many bytes',
      default: 0,
    })
  },
  handler(argv) {
    const {location, algo, maxlen} = argv
    const {path} = dispatcher.parseUrl(location, {slashesDenotesHost: false})
    const vfs = dispatcher.instantiate('/')
    vfs.stat(path, (err, node) => {
      if (err) return err
      // console.log({err, node})
      const checksummer = new Checksummer({algo, maxlen})
      checksummer.process(node)
        .then(data => {
          process.stdout.write(JSON.stringify(data))
        })
        .catch(e => console.error(e))
    })
  }
}
