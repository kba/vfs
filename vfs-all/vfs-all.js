const adapters = [
  require('@kba/vfs-adapter-ar'),
  require('@kba/vfs-adapter-file'),
  require('@kba/vfs-adapter-sftp'),
  require('@kba/vfs-adapter-tar'),
  require('@kba/vfs-adapter-zip'),
]

module.exports.enableAll = function(dispatcher=require('@kba/vfs')) {
  adapters.forEach(adapter => dispatcher.enable(adapter))
}
