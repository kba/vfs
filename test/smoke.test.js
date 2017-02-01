const tap = require('tap')
const async = require('async')
const Path = require('path')
const fsvfs = require('../lib')
const fs = new(fsvfs.file)()

function listProps(cls) {
    const toSkip = new Set(['constructor'])
    return Object.getOwnPropertyNames(cls).filter(prop =>
        !(toSkip.has(prop) || prop.indexOf('_') === 0)
    )
}
const derivedProps = {
    'getdir': ['stat', 'readdir'],
    'find': ['stat', 'readdir'],
    'mkdirRecursive': ['mkdir'],
    'du': ['stat', 'readdir'],
    'copyFile': ['readFile', 'writeFile'],
}
const vfsNames = ['zip', 'file']
const propsByVfs = {}
const RESET = '\x1b[0m'
const OK = '\x1b[32m✓'
const NOT_OK = '\x1b[31m✗'
vfsNames.forEach(vfsName => propsByVfs[vfsName] = new Set(listProps(fsvfs[vfsName].prototype)))
console.log(' '.repeat(15) + vfsNames.join('\t'))
listProps(fsvfs.prototype).forEach(prop => {
    var row = [RESET + (prop + ' '.repeat(50)).substr(0, 15)]
    vfsNames.forEach(vfsName => {
        if (propsByVfs[vfsName].has(prop))
            row.push(OK)
        else if(derivedProps[prop]
            && derivedProps[prop].every(prop => propsByVfs[vfsName].has(prop)))
            row.push(OK)
        else
            row.push(NOT_OK)
    })
    console.log(row.join('\t') + RESET)
})
console.log(listProps(fsvfs))
// console.log(listProps(fsvfs.file))
// console.log(listProps(fsvfs.zip))


