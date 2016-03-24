var ip = require('ip')
var protocols = require('./protocols')

module.exports = Convert

// converts (serializes) addresses
function Convert (proto, a) {
  if (a instanceof Buffer) {
    return Convert.toString(proto, a)
  } else {
    return Convert.toBuffer(proto, a)
  }
}

Convert.toString = function convertToString (proto, buf) {
  proto = protocols(proto)
  switch (proto.code) {
    case 4: // ipv4
    case 41: // ipv6
      return ip.toString(buf)

    case 6: // tcp
    case 17: // udp
    case 33: // dccp
    case 132: // sctp
      return buf2port(buf)
  }
  return buf.toString('hex') // no clue. convert to hex
}

Convert.toBuffer = function convertToBuffer (proto, str) {
  proto = protocols(proto)
  switch (proto.code) {
    case 4: // ipv4
    case 41: // ipv6
      return ip.toBuffer(str)

    case 6: // tcp
    case 17: // udp
    case 33: // dccp
    case 132: // sctp
      return port2buf(parseInt(str, 10))
  }
  return new Buffer(str, 'hex') // no clue. convert from hex
}

function port2buf (port) {
  var buf = new Buffer(2)
  buf.writeUInt16BE(port, 0)
  return buf
}

function buf2port (buf) {
  return buf.readUInt16BE(0)
}
