'use strict';

var fs = require('fs');

function streamFile(file, opt, cb) {
  file.contents = fs.createReadStream(file.path);
  cb(null, file);
}

module.exports = streamFile;
