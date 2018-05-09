const {parseUrl} = require('@kba/utils')

function packUrls(...urls) {
  const protocols = []
  const paths = []
  urls.forEach(url => {
    const {protocol, href} = parseUrl(url)
    protocols.unshift(protocol.substr(0, protocol.length - 1))
    paths.push(href.substr(href.indexOf('://') + 3))
  })
  return `${protocols.join(':')}://${paths.join('!')}`
}

function unpackUrls(str) {
  const idxSep = str.indexOf('://')
  const protocols = str.substr(0, idxSep).split(':')
  const paths = str.substr(idxSep + 3).split('!')
  const len = protocols.length
  const ret = []
  for (let i = 0; i < len; i++) {
    ret.unshift(`${protocols[i]}://${paths[len - 1 - i]}`)
  }
  return ret
}

module.exports = {
  packUrls,
  unpackUrls
}
