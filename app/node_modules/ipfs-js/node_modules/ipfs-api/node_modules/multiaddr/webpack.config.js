var path = require('path')

module.exports = {
  name: 'multiaddr',
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'multiaddr.js',
    libraryTarget: 'var',
    library: 'multiaddr'
  },
  resolve: {
    extensions: ['', '.js', '.json']
  },
  externals: {
    fs: '{}'
  },
  node: {
    Buffer: true
  },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json' }
    ],
    noParse: []
  }
}
