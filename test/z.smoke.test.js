const tap = require('tap')
const vfs = require('@kba/vfs')

const RESET = '\x1b[0m'
const OK = '\x1b[32m✓'
const NOT_OK = '\x1b[31m✗'
const WIDTH_CAP = 20
const WIDTH_VFS = 5

function rightPad(str, pad) {
    return (str + ' '.repeat(100)).substr(0, pad)
}

tap.test('summarize capabilities', t => {
    t.plan(0)
    const vfsNames = ['zip', 'file', 'tar']
    console.log('\t' + ' '.repeat(WIDTH_CAP) + vfsNames.map(
        str => rightPad(str, WIDTH_VFS)).join(''))
    Object.getOwnPropertyNames(vfs.api.prototype).forEach(prop => {
        if (['constructor', 'sync', 'init'].indexOf(prop) > -1) return
        var row = [RESET, rightPad(prop, WIDTH_CAP)]
        vfsNames.forEach(vfsName => {
            const sign = (require(`@kba/vfs-${vfsName}`).capabilities.has(prop)) ? OK : NOT_OK
            row.push(' ' + sign + ' '.repeat(WIDTH_VFS - 2))
            row.push(RESET)
        })
        console.log('\t' + row.join(''))
    })
    t.end()
})
