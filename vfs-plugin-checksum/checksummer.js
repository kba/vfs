const crypto = require('crypto')

module.exports = class Checksummer {

  constructor({algo='md5', maxlen=-1}={}) {
    this.algo = algo
    this.maxlen = maxlen
  }

  isUpToDate(cur, old) {
    if ((this.maxlen <= 0 || this.size <= this.maxlen) && !(this.algo in old))
      return false
    if (this.maxlen > 0 && !(`${this.algo}_${this.maxlen}` in old))
      return false
    return true
  }

  process(node) {
    let {algo, maxlen} = this
    let {path, size, vfs} = node
    return new Promise((resolve, reject) => {
      const checksum = crypto.createHash(algo)
      const is = maxlen <= 0
        ? vfs.createReadStream(path)
        : vfs.createReadStream(path, {start: 0, end: maxlen - 1})
      is.on('error', e => reject(e))
      is.on('end', () => {
        const digest = checksum.digest('hex')
        const ret = {}
        if (maxlen <= 0)
          ret[algo] = digest
        else if (size <= maxlen) {
          ret[algo] = digest
          ret[`${algo}_${maxlen}`] = digest
        } else {
          ret[`${algo}_${maxlen}`] = digest
        }
        return resolve(ret)
      })
      is.on('data', chunk => {
        // if (maxlen > 0) console.log(`[read ${chunk.length}] ${filename}`);
        checksum.update(chunk)
      })
    })

  }
}
