const path = require('path')

const FUNCTIONS_SRC_DIR = path.resolve(__dirname, 'src')
const FUNCTIONS_DIST_DIR = path.resolve(__dirname, 'dist')

module.exports = {
  entry: {
    "getTrackLyrics": path.resolve(FUNCTIONS_SRC_DIR, 'getTrackLyrics.js'),
    "searchTracks": path.resolve(FUNCTIONS_SRC_DIR, 'searchTracks.js'),
  },
  mode: process.env.NODE_ENV,
  target: 'node',
  output: {
    path: FUNCTIONS_DIST_DIR,
    libraryTarget: 'commonjs2'
  }
}