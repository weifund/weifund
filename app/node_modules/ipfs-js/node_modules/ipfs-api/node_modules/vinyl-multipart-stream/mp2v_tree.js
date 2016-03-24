var Multipart = require('multipart-stream')
var duplexify = require('duplexify')
var stream = require('stream')
var Path = require('path')
var collect = require('./collect')
var common = require('./common')
var randomString = common.randomString

module.exports = v2mpTree

// we'll create three streams:
// - w: a writable stream. it receives vinyl files
// - mps: a multipart stream in between.
// - r: a readable stream. it outputs text. needed to
//      give the caller something, while w finishes.
//
// we do all processing on the incoming vinyl metadata
// before we transform to multipart, that's becasue we
// need a complete view of the filesystem. (/ the code
// i lifted did that and it's convoluted enough not to
// want to change it...)
function v2mpTree(opts) {
  opts = opts || {}
  opts.boundary = opts.boundary || randomString()

  var r = new stream.PassThrough({objectMode: true})
  var w = new stream.PassThrough({objectMode: true})
  var out = duplexify.obj(w, r)
  out.boundary = opts.boundary

  collect(w, function(err, files) {
    if (err) {
      r.emit('error', err)
      return
    }

    try {
      // construct the multipart streams from these files
      var mp = streamForCollection(opts.boundary, files)

      // let the user know what the content-type header is.
      // this is because multipart is such a grossly defined protocol :(
      out.multipartHdr = "Content-Type: multipart/mixed; boundary=" + mp.boundary
      if (opts.writeHeader) {
        r.write(out.multipartHdr + "\r\n")
        r.write("\r\n")
      }

      // now we pipe the multipart stream to
      // the readable thing we returned.
      // now the user will start receiving data.
      mp.pipe(r)
    } catch (e) {
      r.emit('error', e)
    }
  })

  return out
}

function streamForCollection(boundary, files) {
  var parts = []

  // walk through all the named files in order.
  files.paths.sort()
  for (var i = 0; i < files.paths.length; i++) {
    var n = files.paths[i]
    var s = streamForPath(files, n)
    if (!s) continue // already processed.
    parts.push({ body: s, headers: headersForFile(files.named[n])})
  }

  // then add all the unnamed files.
  for (var i = 0; i < files.unnamed.length; i++) {
    var f = files.unnamed[i] // raw vinyl files.
    var s = streamForWrapped(files, f)
    if (!s) continue // already processed.
    parts.push({ body: s, headers: headersForFile(f)})
  }

  if (parts.length == 0) { // avoid multipart bug.
    var s = streamForString("--" + boundary + "--\r\n") // close multipart.
    s.boundary = boundary
    return s
  }

  // write out multipart.
  var mp = new Multipart(boundary)
  for (var i = 0; i < parts.length; i++) {
    mp.addPart(parts[i])
  }
  return mp
}

function streamForString(str) {
  var s = new stream.PassThrough()
  s.end(str)
  return s
}

function streamForPath(files, path) {
  var o = files.named[path]
  if (!o) {
    throw new Error("no object for path. lib error.")
  }

  if (!o.file) { // no vinyl file, so no need to process this one.
    return
  }

  // avoid processing twice.
  if (o.done) return null // already processed it
  o.done = true // mark it as already processed.

  return streamForWrapped(files, o)
}

function streamForWrapped(files, f) {
  if (f.file.isDirectory()) {
    return multipartForDir(files, f)
  }

  // stream for a file
  return f.file.contents
}

function multipartForDir(files, dir) {
   // we still write the boundary for the headers
  dir.boundary = randomString()

  if (!dir.children || dir.children.length < 1) {
    // we have to intercept this here and return an empty stream.
    // because multipart lib fails if there are no parts. see
    // https://github.com/hendrikcech/multipart-stream/issues/1
    return streamForString("--" + dir.boundary + "--\r\n") // close multipart.
  }

  var mp = new Multipart(dir.boundary)
  for (var i = 0; i < dir.children.length; i++) {
    var child = dir.children[i]
    if (!child.file) {
      throw new Error("child has no file. lib error")
    }

    var s = streamForPath(files, child.file.path)
    mp.addPart({ body: s, headers: headersForFile(child) })
  }
  return mp
}

function headersForFile(o) {
  var fpath = common.cleanPath(o.file.path, o.file.base)

  var h = {}
  h['Content-Disposition'] = 'file; filename="' + fpath + '"'

  if (o.file.isDirectory()) {
    h['Content-Type'] = 'multipart/mixed; boundary=' + o.boundary
  } else {
    h['Content-Type'] = 'application/octet-stream'
  }

  return h
}
