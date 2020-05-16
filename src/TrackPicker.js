import { getTrackLyrics, searchTracks } from './api'
import React, { useState, useEffect } from 'react'
import { LINES_TO_SHOW } from './lib/constants'

const parseLyrics = (lyrics) => {
  const body = lyrics.lyrics_body
  const trimmed = body.split('*******')[0]
  const allLines = trimmed
    .split(/\r?\n/)
    .filter(l => l.trim() && l.trim() !== '...')

  const start = Math.floor(Math.random() * (allLines.length - LINES_TO_SHOW))
  const lines = allLines.splice(start, LINES_TO_SHOW)
  return lines
}

const TrackPicker = ({ onChange }) => {
  const [query, setQuery] = useState()

  const chooseSong = () => {
    searchTracks({ q: query })
      .then(results => {
        const tracks = results.map(r => r.track).filter(t => t.has_lyrics)
        const rand = Math.floor(Math.random() * tracks.length)
        const randomTrack = tracks[rand]
        randomTrack.genres = []

        if (randomTrack.primary_genres && randomTrack.primary_genres.music_genre_list) {
          randomTrack.primary_genres.music_genre_list.forEach(g => {
            randomTrack.genres.push(g.music_genre.music_genre_name_extended)
          })
        }

        getTrackLyrics({ trackId: randomTrack.track_id })
          .then(lyrics => {
            if (!lyrics.lyrics_body) {
              console.warn('THIS SONG HAS NO LYRICS', randomTrack, lyrics)
              return
            }

            const parsed = parseLyrics(lyrics)
            randomTrack.lyrics = parsed
            onChange(randomTrack)
          })
      })
  }

  return (
    <div className="track-picker">
      <input type="text" placeholder="Optional Song Keyword(s)" onChange={(e) => setQuery(e.target.value)} />
      <br />
      <button onClick={chooseSong}>Start New Round</button>
    </div>
  )
}

export default TrackPicker