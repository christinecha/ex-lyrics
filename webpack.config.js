const path = require('path')

const PUBLIC_DIR = path.resolve(__dirname, 'public')

module.exports = {
  entry: {
    "index.js": path.resolve(__dirname, 'src/index.js')
  },
  mode: 'production',
  devServer: {
    contentBase: PUBLIC_DIR,
    compress: true,
    port: 4242,
    proxy: {
      '/.netlify/*': {
        target: 'http://localhost:8888'
      }
    }
  },
  output: {
    path: path.resolve(PUBLIC_DIR),
    publicPath: '/',
    filename: 'scripts/[name]',
    chunkFilename: 'scripts/[name]',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
    ]
  }
}