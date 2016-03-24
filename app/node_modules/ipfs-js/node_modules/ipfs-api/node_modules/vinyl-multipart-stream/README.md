# node-vinyl-multipart-stream

Turns a vinyl stream into HTTP multipart.

## Usage

```js
var vinylfs = require('vinyl-fs-that-respects-files')
var vmps = require('vinyl-multipart-stream')

vinylfs.src("./**/*")
  .pipe(vmps({writeHeader: true}))
  .pipe(process.stdout)
```
