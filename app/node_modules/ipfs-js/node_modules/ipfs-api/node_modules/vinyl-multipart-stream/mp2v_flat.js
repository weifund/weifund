var Multipart = require('multipart-stream')
var duplexify = require('duplexify')
var stream = require('stream')
var common = require('./common')
randomString = common.randomString

module.exports = v2mpFlat

// we'll create three streams:
// - w: a writable stream. it receives vinyl files
// - mp: a multipart stream
// - r: a readable stream. it outputs multipart data
function v2mpFlat(opts) {
  opts = opts || {}
  opts.boundary = opts.boundary || randomString()

  var w = new stream.Writable({objectMode: true})
  var r = new stream.PassThrough({objectMode: true})
  var mp = new Multipart(opts.boundary)

  // connect w -> mp
  w._write = function(file, enc, cb) {
    writePart(mp, file, cb)
  }

  // connect mp -> r
  w.on('finish', function() {
    // apparently cannot add parts while streaming :(
    mp.pipe(r)
  })

  var out = duplexify.obj(w, r)
  out.boundary = opts.boundary
  return out
}

function writePart(mp, file, cb) {
  var c = file.contents
  if (c === null)
    c = emptyStream()

  mp.addPart({
    body: file.contents,
    headers: headersForFile(file),
  })
  cb(null)
  // TODO: call cb when file.contents ends instead.
}

function emptyStream() {
  var s = new stream.PassThrough({objectMode: true})
  s.write(null)
  return s
}

function headersForFile(file) {
  var fpath = common.cleanPath(file.path, file.base)

  var h = {}
  h['Content-Disposition'] = 'file; filename="' +fpath+ '"'

  if (file.isDirectory()) {
    h['Content-Type'] = 'text/directory'
  } else {
    h['Content-Type'] = 'application/octet-stream'
  }

  return h
}

function randomString () {
  return Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
}
