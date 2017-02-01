const tap = require('tap')
const async = require('async')
const fsvfs = require('../lib')
const fs = new(fsvfs.file)()
const Path = require('path')

function listProps(cls) {
    const toSkip = new Set(['on', 'once', 'emit', 'constructor'])
    return Object.getOwnPropertyNames(cls).filter(prop =>
        !(toSkip.has(prop) || prop.indexOf('_') === 0)
    )
}
const vfsNames = ['zip', 'file']
const propsByVfs = {}
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const RESET = '\x1b[0m'
vfsNames.forEach(vfsName => propsByVfs[vfsName] = new Set(listProps(fsvfs[vfsName].prototype)))
console.log(' '.repeat(15) + vfsNames.join('\t'))
listProps(fsvfs.prototype).forEach(prop => {
    var row = [RESET + (prop + ' '.repeat(50)).substr(0, 15)]
    vfsNames.forEach(vfsName => {
        row.push(propsByVfs[vfsName].has(prop) ? `${GREEN}✓` : `${RED}✗`)
    })
    console.log(row.join('\t') + RESET)
})
console.log(listProps(fsvfs))
// console.log(listProps(fsvfs.file))
// console.log(listProps(fsvfs.zip))


