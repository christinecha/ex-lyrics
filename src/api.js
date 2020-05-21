import axios from 'axios'

export const getTrackLyrics = ({ trackId }) => {
  return axios({
    url: `/.netlify/functions/getTrackLyrics?trackId=${trackId}`,
    method: 'GET'
  }).then(res => {
    return res.data.lyrics
  })
}

export const getRichSync = ({ trackId }) => {
  return axios({
    url: `/.netlify/functions/getRichSync?trackId=${trackId}`,
    method: 'GET'
  }).then(res => {
    console.log(res)
    // return res.data.lyrics
  })
}

export const searchTracks = ({ q = '' }) => {
  return axios({
    url: `/.netlify/functions/searchTracks?q=${q}`,
    method: 'GET'
  }).then(res => {
    return res.data.track_list.filter(t => !t.track.explicit)
  })
}