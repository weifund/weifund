module.exports = (config) => {
  const path = require('path')

  config.set({
    basePath: '',
    frameworks: ['mocha'],

    files: [
      'tests/test.js'
    ],

    preprocessors: {
      'tests/*': ['webpack']
    },

    webpack: {
      output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
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
    },

    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true
      }
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],
    singleRun: true
  })
}
