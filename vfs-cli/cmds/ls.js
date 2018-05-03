const dispatcher = require('@kba/vfs')
const dateformat = require('dateformat')
require('@kba/vfs-all-adapters').enableAll(dispatcher)

function rpad(str, len) {return (str + ' '.repeat(len)).substr(0, len)}
function lpad(str, len) {return (' '.repeat(len) + str).substr(-len)}

function modestring(node) {
  let ret = ''
  ret += node.isDirectory ? 'd' : '-'
  const oct = node.mode.toString(8).substr(-3).split('')
  let ugo = [
    {r: false, w: false, x: false},
    {r: false, w: false, x: false},
    {r: false, w: false, x: false},
  ]
  for (let i in ugo) {
    const v = oct[i]
    if (v >= 4)
      ugo[i].r = true
    if (v == 2 || v == 3 || v == 6 || v == 7)
      ugo[i].w = true
    if (v == 1 || v == 3 || v == 5 || v == 7)
      ugo[i].x = true
  }
  return ret + ugo.map(who => [
    who.r ? 'r' : '-',
    who.w ? 'w' : '-',
    who.x ? 'x' : '-',
  ].join('')).join('')
}

class AnsiRenderer {

  constructor(argv) {
    this.argv = argv
  }

  async renderRow(node) {
    const date = dateformat(node.mtime, 'yyyy-mm-dd hh:mm')
    const name = await this.renderName(node)
    const mode = modestring(node)
    return Promise.resolve([
      mode,
      lpad(node.size, 8),
      date,
      name
    ].join(' '))
  }

  async renderName(node) {
    const {url} = this.argv
    const color = node.isDirectory ? '\x1b[34;1m' : '\x1b[0m'
    const str = url ? node.url : node['%base']
    const ret = `${color}${str}\x1b[0m`
    return Promise.resolve(ret)
  }

  async render(node) {
    const ret = []
    const {directoriesFirst} = this.argv
    const renderOne = async f => this[this.argv.long ? 'renderRow' : 'renderName'](f)
    if (!node.isDirectory) {
      ret.push(renderOne(node))
    } else {
      const contents = await new Promise((resolve, reject) => {
        node.vfs.getdir(node.path, {directoriesFirst}, (err, contents) => {
          return err ? reject(err) : resolve(contents)
        })
      })
      contents.forEach(f => ret.push(renderOne(f)))
    }
    return Promise.all(ret).then(strs => {
      return strs.join(this.argv.long ? '\n' : ' ')
    })
  }

}

module.exports = {
  command: 'ls <location>',
  desc: 'ls(1) a vfs node',
  builder(argv) {
    argv
      .option('long', {
        alias: ['l'],
        desc: 'Long format',
        type: 'boolean',
        default: false,
      })
      .option('url', {
        alias: ['U'],
        type: 'boolean',
        default: false,
        desc: 'List names as URL'
      })
      .option('group-directories-first', {
        alias: ['directoriesFirst', 'G'],
        type: 'boolean',
        default: true,
        desc: 'Group directories first'
      })
  },
  handler(argv) {
    const {
      location,
    } = argv
    const renderer = new AnsiRenderer(argv)
    const {path} = dispatcher.parseUrl(location, {slashesDenotesHost: false})
    const vfs = dispatcher.instantiate('/')
    vfs.stat(path, (err, node) => {
      renderer.render(node).then(str => {
        console.log(str)
      })
      .catch(err => console.error(err))
    })
  }
}
