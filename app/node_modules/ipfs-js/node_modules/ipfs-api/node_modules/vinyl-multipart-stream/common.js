var x = module.exports = {}
x.randomString = randomString
x.cleanPath = cleanPath

function randomString () {
  return Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2)
}

function cleanPath(path, base) {
  if (!path) return ''
  if (!base) return path

  if (base[base.length-1] != '/') {
    base += "/"
  }

  // remove base from path
  path = path.replace(base, '')
  path = path.replace(/[\/]+/g, '/')
  return path
}
