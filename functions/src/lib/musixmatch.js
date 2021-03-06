const MUSIXMATCH_API_KEY = process.env.MUSIXMATCH_API_KEY

const MUSIXMATCH_URL = 'https://api.musixmatch.com/ws/1.1'
const API_KEY = `apikey=${MUSIXMATCH_API_KEY}`

module.exports = {
  getRichSync: ({ trackId }) =>
    `${MUSIXMATCH_URL}/track.richsync.get?track_id=${trackId}&${API_KEY}`,
  getTrackLyrics: ({ trackId }) =>
    `${MUSIXMATCH_URL}/track.lyrics.get?track_id=${trackId}&${API_KEY}`,
  searchTracks: ({ q }) =>
    `${MUSIXMATCH_URL}/track.search?q=${q}&f_has_richsync=1&f_lyrics_language=en&page_size=20&s_track_rating=desc&${API_KEY}`,
}