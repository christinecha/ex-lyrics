let secrets = {
  MUSIXMATCH_API_KEY: process.env.MUSIXMATCH_API_KEY
}

// if (!secrets.MUSIXMATCH_API_KEY) {
//   try {
//     secrets = require('../../secrets.json')
//   } catch (e) { }
// }

const { MUSIXMATCH_API_KEY } = secrets

const MUSIXMATCH_URL = 'https://api.musixmatch.com/ws/1.1'
const API_KEY = `apikey=${MUSIXMATCH_API_KEY}`

module.exports = {
  getTrackLyrics: ({ trackId }) => `${MUSIXMATCH_URL}/track.lyrics.get?track_id=${trackId}&${API_KEY}`,
  searchTracks: ({ q }) => `${MUSIXMATCH_URL}/track.search?q=${q}&f_lyrics_language=en&page_size=20&s_track_rating=desc&${API_KEY}`,
}