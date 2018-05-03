const tap = require('tap')
const api = require('@kba/vfs/api')

const RESET = '\x1b[0m'
const OK = '\x1b[32mX'
const NOT_OK = '\x1b[31m-'
const WIDTH_CAP = 20
const WIDTH_VFS = 5

function rightPad(str, pad) {
    return (str + ' '.repeat(100)).substr(0, pad)
}

const SILENT = process.env.SILENT === 'true'

tap.test('summarize capabilities', t => {
    t.plan(0)
    const vfsNames = ['zip', 'file', 'tar', 'ar', 'sftp']
    if (!SILENT)
      console.log('\t' + ' '.repeat(WIDTH_CAP) + vfsNames.map(
          str => rightPad(str, WIDTH_VFS)).join(''))
    const props = Object.getOwnPropertyNames(api.prototype)
    props.forEach(prop => {
        vfsNames.forEach(vfsName => {
            const vfsClass = require(`@kba/vfs-adapter-${vfsName}`)
            if (prop.indexOf('constructor') === -1 && vfsClass.prototype.hasOwnProperty(prop)) {
                throw new Error(`vfs-adapter-${vfsName} should not override ${prop}`)
            }
        })
        if (['constructor', 'use', 'sync', 'init', 'end'].indexOf(prop) > -1) return
        let row = [RESET, rightPad(prop, WIDTH_CAP)]
        vfsNames.forEach(vfsName => {
            const vfsClass = require(`@kba/vfs-adapter-${vfsName}`)
            const sign = (vfsClass.capabilities.has(prop)) ? OK : NOT_OK
            row.push(' ' + sign + ' '.repeat(WIDTH_VFS - 2))
            row.push(RESET)
        })
        if (!SILENT)
          console.log('\t' + row.join(''))
    })
    t.end()
})
