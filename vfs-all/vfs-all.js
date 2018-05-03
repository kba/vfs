const adapters = [
  require('@kba/vfs-ar'),
  require('@kba/vfs-file'),
  require('@kba/vfs-sftp'),
  require('@kba/vfs-tar'),
  require('@kba/vfs-zip'),
]

module.exports.enableAll = function(dispatcher=require('@kba/vfs')) {
  adapters.forEach(adapter => dispatcher.enable(adapter))
}
