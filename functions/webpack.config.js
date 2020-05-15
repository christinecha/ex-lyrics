const path = require('path')

const PUBLIC_DIR = path.resolve(__dirname, 'public')

module.exports = {
  entry: {
    'getTrackLyrics': path.resolve(__dirname, 'src/getTrackLyrics.js'),
    'searchTracks': path.resolve(__dirname, 'src/searchTracks.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  target: 'node'
}