js-multiaddr
============

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/jbenet/js-multiaddr.svg?style=flat-square)](https://travis-ci.org/jbenet/js-multiaddr)
![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/jbenet/js-multiaddr.svg?style=flat-square)](https://david-dm.org/jbenet/js-multiaddr)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [multiaddr](https://github.com/jbenet/multiaddr) implementation in JavaScript.

# Usage

### In Node.js through npm

```bash
> npm install multiaddr --save
```

```JavaScript
const multiaddr = require('multiaddr')
```

### In the Browser through Webpack

Same as in Node.js, you just have to transpile it with Webpack before serving the code. Follow the webpack config example.

### In the Browser through browserify

Same as in Node.js, you just have to [browserify](https://github.com/substack/node-browserify) the code before serving it. See the browserify repo for how to do that.

### In the Browser through `<script>` tag

Make the [multiaddr.js](/dist/multiaddr.js) available through your server and load it using a normal `<script>` tag, this will export the `multiaddr` on the `window` object, such that:

```JavaScript
const multiaddr = window.multiaddr
```

#### Gotchas

You will need to use Node.js `Buffer` API compatible, if you are running inside the browser, you can access it by `multiaddr.Buffer` or you can install Feross's [Buffer](https://github.com/feross/buffer).

# Examples

### Simple

```JavaScript
const multiaddr = require('multiaddr')
const addr = multiaddr("/ip4/127.0.0.1/udp/1234")
// <Multiaddr /ip4/127.0.0.1/udp/1234>
addr.buffer
// <Buffer >
addr.toString()
// /ip4/127.0.0.1/udp/1234

// construct with Buffer
addr = multiaddr(addr.buffer)
// <Multiaddr /ip4/127.0.0.1/udp/1234>
```

### Protocols

```JavaScript
// get the multiaddr protocol codes
addr.protoCodes()
// [4, 6]

// get the multiaddr protocol string codes
addr.protoNames()
// ['ip4', 'tcp']

// get the multiaddr protocol description objects
addr.protos()
// [{code: 4, name: 'ip4', size: 32},
//  {code: 17, name: 'udp', size: 16}]
```

### Other formats

```JavaScript
// get a node friendly address object
addr.nodeAddress()
// {family: "IPv4", port:1234, address: "127.0.0.1"} - note no UDP :(
addr.fromNodeAddress({family: "IPv4", port:1234, address: "127.0.0.1"}, 'udp')
// /ip4/127.0.0.1/udp/1234

// handles the stupid string version too
addr = multiaddr.fromStupidString("udp4://127.0.0.1:1234")
// <Multiaddr /ip4/127.0.0.1/udp/1234>
addr.toStupidString(buf)
// udp4://127.0.0.1:1234
```

### En/decapsulate

```JavaScript
addr.encapsulate('/sctp/5678')
// <Multiaddr /ip4/127.0.0.1/udp/1234/sctp/5678>
addr.decapsulate('/udp') // up to + inc last occurrence of this subaddr
// <Multiaddr /ip4/127.0.0.1>
```

### Tunneling

Multiaddr allows expressing tunnels very nicely.

```JavaScript
const printer = multiaddr('/ip4/192.168.0.13/tcp/80')
const proxy = multiaddr('/ip4/10.20.30.40/tcp/443')
const printerOverProxy = proxy.encapsulate(printer)
// <Multiaddr /ip4/10.20.30.40/tcp/443/ip4/192.168.0.13/tcp/80>

const proxyAgain = printerOverProxy.decapsulate('/ip4')
// <Multiaddr /ip4/10.20.30.40/tcp/443>
```
