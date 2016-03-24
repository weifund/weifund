#!/usr/bin/env node

var vinylfs = require('vinyl-fs-that-respects-files')
var vmps = require('./index')

var usage = "usage: multipart-stream <paths>...\n"
  + "reads paths and returns a multipart including all files.\n"
  + "this is useful to post entire file trees"

var paths = process.argv.slice(2)
if (paths.length < 1) {
  process.stderr.write(usage + "\n")
  os.exit(0)
}

vinylfs.src(paths)
  .pipe(vmps({writeHeader: true}))
  .pipe(process.stdout)
