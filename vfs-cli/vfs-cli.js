#!/usr/bin/env node
const path = require('path')
const fs = require('fs')
const VFS_CLI_PATH=process.env.VFS_CLI_PATH ? process.env.VFS_CLI_PATH : [
    `${process.env.HOME}/.local`,
    // '/usr/local',
    // '/usr',
  ].map(prefix => `${prefix}/share/vfs/`).join(':')

// console.log(VFS_CLI_PATH)
let yargs = require('yargs')

;['cmds', ...VFS_CLI_PATH.split(':')].forEach(p => {
  try {
    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      fs.readdirSync(p).forEach(f => {
        if (f.match(/^vfs-/)) {
          // console.log(`Adding module ${p} @ ${f}`)
          try {
            f = path.join(p, f)
            // console.log(Object.keys(require.cache))
            // console.log(require.resolve(f))
            yargs = yargs.command(require(f))
          } catch (e) {
            console.log(e)
          }
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
