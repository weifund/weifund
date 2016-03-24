'use strict';

var through2 = require('through2');
var prepareWrite = require('../prepareWrite');
var writeContents = require('./writeContents');

function dest(outFolder, opt) {
  if (!opt) {
    opt = {};
  }

  function saveFile(file, enc, cb) {
    prepareWrite(outFolder, file, opt, function(err, writePath) {
      if (err) {
        return cb(err);
      }
      writeContents(writePath, file, cb);
    });
  }

  return through2.obj(saveFile);
}

module.exports = dest;
