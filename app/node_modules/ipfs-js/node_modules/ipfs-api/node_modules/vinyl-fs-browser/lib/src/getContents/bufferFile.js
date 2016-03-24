'use strict';

var fs = require('fs');

function bufferFile(file, opt, cb) {
  fs.readFile(file.path, function(err, data) {
    if (err) {
      return cb(err);
    }
    file.contents = data;
    cb(null, file);
  });
}

module.exports = bufferFile;
