var map = require('lodash.map')

module.exports = Protocols

function Protocols (proto) {
  if (typeof (proto) === 'number') {
    if (Protocols.codes[proto]) {
      return Protocols.codes[proto]
    }

    throw new Error('no protocol with code: ' + proto)
  } else if (typeof (proto) === 'string' || proto instanceof String) {
    if (Protocols.names[proto]) {
      return Protocols.names[proto]
    }

    throw new Error('no protocol with name: ' + proto)
  }

  throw new Error('invalid protocol id type: ' + proto)
}

// replicating table here to:
// 1. avoid parsing the csv
// 2. ensuring errors in the csv don't screw up code.
// 3. changing a number has to happen in two places.

Protocols.table = [
  [4, 32, 'ip4'],
  [6, 16, 'tcp'],
  [17, 16, 'udp'],
  [33, 16, 'dccp'],
  [41, 128, 'ip6'],
  [132, 16, 'sctp'],
  // these require varint for the protocol code
  [302, 0, 'utp'],
  [480, 0, 'http'],
  [443, 0, 'https'],
  [477, 0, 'websockets']
]

Protocols.names = {}
Protocols.codes = {}

// populate tables
map(Protocols.table, function (e) {
  var proto = p.apply(this, e)
  Protocols.codes[proto.code] = proto
  Protocols.names[proto.name] = proto
})

Protocols.object = p

function p (code, size, name) {
  return {code: code, size: size, name: name}
}
