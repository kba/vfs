const fs = new(require('.'))({
    sshOptions: {
        host: '127.0.0.1',
        port: '22',
        username: 'kb',
        privateKey: require('fs').readFileSync(`${process.env.HOME}/.ssh/id_rsa`)
    }
})
fs.on('error', err => console.log("ERROR", err))
fs.once('sync', () => {
    console.log('connected')
    fs.getdir(__dirname, (err, list) => {
        console.log({err, list})
        fs.end()
    })
})
fs.init()
