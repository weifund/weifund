var Path = require('path')

module.exports = collect

function collect(stream, cb) {

  // we create a collection of objects, where
  // - names is a list of all paths
  // - there are per-file objects: { file: <vinyl file>, children [ paths ] }
  // - named is a map { path: fo }
  var files = {
    paths: [],
    named: {}, // wrapped files.
    unnamed: [], // wrapped files.
  }

  function get(name) {
    if (!files.named[name]) {
      files.named[name] = {
        children: [],
      }
    }
    return files.named[name]
  }

  stream.on('data', function(file) {
    if (cb === null) {
      // already errored, or no way to externalize result
      stream.on('data', function() {}) // de-register
      return // do nothing.
    }

    if (file.path) {
      // add file to named
      var fo = get(file.path)
      fo.file = file

      // add reference to file at parent
      var po = get(Path.dirname(file.path))
      if (fo !== po) po.children.push(fo)

      // add name to names list.
      files.paths.push(file.path)
    } else {
      files.unnamed.push({ file: file, children: [] })
    }
  })

  stream.on('error', function(err) {
    cb && cb(err)
    cb = null
  })

  stream.on('end', function() {
    cb && cb(null, files)
    cb = null
  })
}
