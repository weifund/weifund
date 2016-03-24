var gaze = require('gaze');
var EventEmitter = require('events').EventEmitter;

function onWatch(out, cb){
  return function(err, rwatcher){
    if (err) out.emit('error', err);
    rwatcher.on('all', function(evt, path, old){
      var outEvt = {type: evt, path: path};
      if(old) outEvt.old = old;
      out.emit('change', outEvt);
      if(cb) cb();
    });
  }
}

module.exports = function(glob, opts, cb) {
  var out = new EventEmitter();

  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  var watcher = gaze(glob, opts, onWatch(out, cb));

  watcher.on('end', out.emit.bind(out, 'end'));
  watcher.on('error', out.emit.bind(out, 'error'));
  watcher.on('ready', out.emit.bind(out, 'ready'));
  watcher.on('nomatch', out.emit.bind(out, 'nomatch'));

  out.end = function(){
    return watcher.close();
  };
  out.add = function(glob, cb){
    return watcher.add(glob, onWatch(out, cb));
  };
  out.remove = function(glob){
    return watcher.remove(glob);
  };
  out._watcher = watcher;

  return out;
};
