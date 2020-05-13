import axios from 'axios'

let secrets = {}

try {
  secrets = require('../secrets.json')
} catch (e) { }

const { MUSIXMATCH_API_KEY } = secrets

const MUSIXMATCH_URL = 'https://api.musixmatch.com/ws/1.1'
const API_KEY = `apikey=${MUSIXMATCH_API_KEY}`


export const getTrackLyrics = (trackId) => {
  const GET_TRACK_LYRICS = `${MUSIXMATCH_URL}/track.lyrics.get?track_id=${trackId}&${API_KEY}`
  axios({
    url: GET_TRACK_LYRICS,
    method: 'GET',
    crossdomain: true
  }).then(res => {
    console.log(res)
  })
}