#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
let yargs = require('yargs')

process.env.PATH.split(':').forEach(p => {
  try {
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      fs.readdirSync(p)
        .filter(f => f.match(/^vfs-cli-/))
        .forEach(f => {
          // console.log(`Adding module ${p} @ ${f}`)
          try {
            f = path.join(p, f)
            // console.log(Object.keys(require.cache))
            // console.log(require.resolve(f))
            yargs = yargs.command(require(f))
          } catch (e) {
            console.log(e)
          }
        })
    }
  } catch (e) {
    // NOTE ignore errors
  }
})


yargs = yargs
  .commandDir('cmds')
  .demandCommand()
  .help('h')
  // .command('*', true, () => {
  //   console.log('FOOO')
  // })

console.log(yargs.argv)
