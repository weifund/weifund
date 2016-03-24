var map = require('lodash.map')
var extend = require('xtend')
var codec = require('./codec')
var protocols = require('./protocols')
var NotImplemented = new Error('Sorry, Not Implemented Yet.')
var varint = require('varint')

exports = module.exports = Multiaddr

function Multiaddr (addr) {
  if (!(this instanceof Multiaddr)) {
    return new Multiaddr(addr)
  }

  // defaults
  if (!addr) {
    addr = ''
  }

  if (addr instanceof Buffer) {
    this.buffer = codec.fromBuffer(addr)
  } else if (typeof (addr) === 'string' || addr instanceof String) {
    this.buffer = codec.fromString(addr)
  } else if (addr.buffer && addr.protos && addr.protoCodes) { // Multiaddr
    this.buffer = codec.fromBuffer(addr.buffer) // validate + copy buffer
  } else {
    throw new Error('addr must be a string, Buffer, or another Multiaddr')
  }
}

// get the multiaddr protocols
Multiaddr.prototype.toString = function toString () {
  return codec.bufferToString(this.buffer)
}

// get the multiaddr as a convinent options object to be dropped in net.createConnection
Multiaddr.prototype.toOptions = function toOptions () {
  var opts = {}
  var parsed = this.toString().split('/')
  opts.family = parsed[1] === 'ip4' ? 'ipv4' : 'ipv6'
  opts.host = parsed[2]
  opts.port = parsed[4]
  return opts
}

// get the multiaddr protocols
Multiaddr.prototype.inspect = function inspect () {
  return '<Multiaddr ' +
  this.buffer.toString('hex') + ' - ' +
  codec.bufferToString(this.buffer) + '>'
}

// get the multiaddr protocols
Multiaddr.prototype.protos = function protos () {
  return map(this.protoCodes(), function (code) {
    console.log('->', code)
    return extend(protocols(code))
  // copy to prevent users from modifying the internal objs.
  })
}

// get the multiaddr protocols
Multiaddr.prototype.protos = function protos () {
  return map(this.protoCodes(), function (code) {
    return extend(protocols(code))
    // copy to prevent users from modifying the internal objs.
  })
}

// get the multiaddr protocol codes
Multiaddr.prototype.protoCodes = function protoCodes () {
  var codes = []
  for (var i = 0; i < this.buffer.length; i++) {
    var code = varint.decode(this.buffer, i)
    var size = protocols(code).size / 8
    i = i + varint.decode.bytes - 1
    i += size // skip over proto data
    codes.push(code)
  }
  return codes
}

// get the multiaddr protocol string names
Multiaddr.prototype.protoNames = function protoNames () {
  return map(this.protos(), function (proto) {
    return proto.name
  })
}

// Returns a tuple of parts:
Multiaddr.prototype.tuples = function tuples () {
  return codec.bufferToTuples(this.buffer)
}

// Returns a tuple of string parts:
Multiaddr.prototype.stringTuples = function stringTuples () {
  var t = codec.bufferToTuples(this.buffer)
  return codec.tuplesToStringTuples(t)
}

Multiaddr.prototype.encapsulate = function encapsulate (addr) {
  addr = Multiaddr(addr)
  return Multiaddr(this.toString() + addr.toString())
}

Multiaddr.prototype.decapsulate = function decapsulate (addr) {
  addr = addr.toString()
  var s = this.toString()
  var i = s.lastIndexOf(addr)
  if (i < 0) {
    throw new Error('Address ' + this + ' does not contain subaddress: ' + addr)
  }
  return Multiaddr(s.slice(0, i))
}

Multiaddr.prototype.equals = function equals (addr) {
  return this.buffer.equals(addr.buffer)
}

// get a node friendly address object
Multiaddr.prototype.nodeAddress = function nodeAddress () {
  if (!this.isThinWaistAddress()) {
    throw new Error('Multiaddr must be "thin waist" address for nodeAddress.')
  }

  var codes = this.protoCodes()
  var parts = this.toString().split('/').slice(1)
  return {
    family: (codes[0] === 41) ? 'IPv6' : 'IPv4',
    address: parts[1], // ip addr
    port: parts[3] // tcp or udp port
  }
}

// from a node friendly address object
Multiaddr.fromNodeAddress = function fromNodeAddress (addr, transport) {
  if (!addr) throw new Error('requires node address object')
  if (!transport) throw new Error('requires transport protocol')
  var ip = (addr.family === 'IPv6') ? 'ip6' : 'ip4'
  return Multiaddr('/' + [ip, addr.address, transport, addr.port].join('/'))
}

// returns whether this address is a standard combination:
// /{IPv4, IPv6}/{TCP, UDP}
Multiaddr.prototype.isThinWaistAddress = function isThinWaistAddress (addr) {
  var protos = (addr || this).protos()
  if (protos.length !== 2) {
    return false
  }
  if (protos[0].code !== 4 && protos[0].code !== 41) {
    return false
  }
  if (protos[1].code !== 6 && protos[1].code !== 17) {
    return false
  }
  return true
}

// parses the "stupid string" format:
// <proto><IPv>://<IP Addr>[:<proto port>]
// udp4://1.2.3.4:5678
Multiaddr.prototype.fromStupidString = function fromStupidString (str) {
  throw NotImplemented
}

// patch this in
Multiaddr.protocols = protocols
