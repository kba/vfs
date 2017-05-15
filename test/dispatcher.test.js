const tap = require('tap')

tap.test('byScheme', t => {
    const dispatcher = require('@kba/vfs')
    const filevfs = require('@kba/vfs-file')
    const zipvfs = require('@kba/vfs-zip')
    dispatcher.enable(filevfs)
    t.equals(dispatcher.get('file'), filevfs, 'get(file)')
    t.end()
})
