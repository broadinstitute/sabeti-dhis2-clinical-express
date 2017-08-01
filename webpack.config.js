const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const devMode = process.env.NODE_ENV === 'development'

const config = {
  entry: ['babel-polyfill', './app/main.js'],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  context: __dirname,
  devtool: 'source-map',
  resolve: {
  extensions: ['.js', '.json', '*']
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel', }
    ],
    rules: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015', 'stage-1']
      }
    },
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }
  ]
  },
  plugins: []
}

if (devMode) {
  config.plugins.push(
    new LiveReloadPlugin({
      appendScriptTag: true
    })
  )
}

module.exports = config
