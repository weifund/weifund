var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
  killMeteor();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  var url = process.env.ROOT_URL || 'http://localhost:3000/' 
  // and load the index.html of the app.
  mainWindow.loadUrl(url);

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

function killMeteor(){
  var canKillMeteor = process.env.KILL_METEOR_ON_EXIT;
  var meteorPID = process.env.METEOR_PARENT_PID;

  if(!canKillMeteor)
    return;

  process.kill(meteorPID, 'SIGKILL');
}