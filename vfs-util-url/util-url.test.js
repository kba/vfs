const tap = require('tape')
const {
  packUrls,
  unpackUrls
} = require('.')

console.log()

const examples = [
  {
    packed: 'zip:///foo/bar',
    unpacked: ['zip:///foo/bar'],
  },
  {
    packed: 'zip:file:///bla.zip!/foo/bar',
    unpacked: ['file:///bla.zip', 'zip:///foo/bar'],
  },
  {
    packed: 'tar:zip:file:///bla.zip!/foo/bar.tar!blah',
    unpacked: ['file:///bla.zip', 'zip:///foo/bar.tar', 'tar://blah'],
  }
]

tap.test('packUrls/unpackUrls', t => {
  t.plan(examples.length * 2)
  examples.forEach(example => {
    t.equals(packUrls(...example.unpacked), example.packed, `pack ${JSON.stringify(example)}`)
  })
  examples.forEach(example => {
    t.deepEquals(unpackUrls(example.packed), example.unpacked, `unpack ${JSON.stringify(example)}`)
  })
})

