import { getTrackLyrics, searchTracks } from './api'
import React, { useState, useEffect } from 'react'
import firebase from './lib/firebase'
import useUser from './useUser';

// Pick a random song.
// Show lyrics of song
// Users guess following three words
// Show following three words
// Vote

const LINES_TO_SHOW = 5
const SECRET_LINE = Math.floor(LINES_TO_SHOW / 2)
const CORRECT_KEY = 'CORRECT'
const chop = (uid) => uid.slice(0, 4)

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

const LyricsDisplay = ({ lyrics, secret }) => {
  return (
    <div className='lyrics'>
      <div>...</div>
      {lyrics.map((line, i) => {
        const words = line.split(/\s/)
        const isMystery = secret && i === SECRET_LINE

        return (
          <div>
            {!isMystery && line}
            {isMystery && '________________________________'}
            {/* {isMystery && words.map((word, i) => {
              const hideWord = true
              const style = {
                margin: hideWord ? '0 3px' : '0',
                borderBottom: hideWord ? '1px solid black' : 'none'
              }
              const empty = new Array(5).fill('  ').join('')

              return (
                <span style={style}>{hideWord ? empty : word}</span>
              )
            })} */}
          </div>
        )
      })}
      <div>...</div>
    </div>
  )
}

const TrackPreview = ({ track, secret }) => {
  return (
    <div className='track-preview'>
      <h3 className='track-name'>{track.track_name}</h3>
      <h4 className='track-album'>from the album "{track.album_name}"</h4>
      <h4 className='track-artist'>by {track.artist_name}</h4>
      <p className='track-genres'>
        {track.genres && track.genres.map(genre => (
          <span key={genre}>{genre}</span>
        ))}
      </p>

      {track.lyrics && <LyricsDisplay lyrics={track.lyrics} secret={secret} />}
    </div>
  )
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
            const parsed = parseLyrics(lyrics)
            randomTrack.lyrics = parsed

            onChange(randomTrack)
          })
      })
  }

  return (
    <div>
      {/* <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} /> */}
      <button onClick={chooseSong}>Start New Round</button>
    </div>
  )
}

const Entry = ({ onSubmit }) => {
  const [entry, setEntry] = useState()

  return (
    <div>
      <input type="text" value={entry} onChange={(e) => setEntry(e.target.value)} />
      <button onClick={() => onSubmit(entry)}>Submit Entry</button>
    </div>
  )
}

const Ballot = ({ entries, ready, onVote }) => {
  if (!ready) {
    return <div>Writing...</div>
  }

  return (
    <div>
      Choose the correct line!
      <div>
        {entries.map(entry => {
          return (
            <p>
              <span className="vote" onClick={() => onVote(entry)}>VOTE</span>
              {entry.text}
            </p>
          )
        })}
      </div>
    </div>
  )
}

const Users = ({ users }) => {
  return (
    <div className='users-list'>
      In this room:
      {users
        .map(user => (
          <p>{chop(user.uid)}</p>
        ))}
    </div>
  )
}

const Results = ({ entries, users, votes }) => {

  return (
    <div className='results'>
      <h3>RESULTS</h3>

      {entries.map(entry => {
        const entryVotes = votes.filter(v => v.entryId === entry.id)
        const user = users.find(u => u.uid === entry.userId)

        return (
          <div className='results-entry' data-correct={!user}>
            <p>{entry.text}</p>
            <p className='byline'>[{user ? chop(user.uid) : 'CORRECT'}]</p>
            --
            <p>{entryVotes.length} votes</p>
          </div>
        )
      })}
    </div>
  )
}

const Room = ({ id }) => {
  const [room, setRoom] = useState()
  const user = useUser()
  const roomRef = firebase.database().ref('rooms').child(id)

  useEffect(() => {
    setRoom()

    if (!user) return

    const userRef = roomRef.child('users').child(user.uid)
    userRef.update({ ...user, online: true })

    roomRef.on('value', snapshot => {
      const val = snapshot.val()
      setRoom(val)
    })

    userRef.onDisconnect().update({ online: false })
  }, [id, user])

  if (!room) return null

  const startNewRound = ({ track }) => {
    const newRoundRef = roomRef.child('rounds').push()
    newRoundRef.update({
      track,
      entries: {
        [CORRECT_KEY]: {
          id: CORRECT_KEY,
          text: track.lyrics[SECRET_LINE],
        }
      }
    })
    roomRef.update({ activeRound: newRoundRef.key })
  }

  const round = room.rounds[room.activeRound]

  if (!round) {
    console.warn('No round found.')
    return null
  }

  const roundRef = roomRef.child('rounds').child(room.activeRound)

  const submitEntry = (entry) => {
    // DO NOT ALLOW MULTIPLE ENTRIES
    const entryRef = roundRef.child('entries').push()
    entryRef.set({
      id: entryRef.key,
      text: entry,
      userId: user.uid
    })
  }

  console.log(room, round)
  const myVote = round.votes && round.votes[user.uid]
  const entries = Object.values(round.entries || {})
  const myEntry = entries.find(e => e.userId === user.uid)
  const votes = Object.values(round.votes || {})
  const users = Object.values(room.users || {}).filter(u => u.online)
  const ready = entries.length > users.length

  const vote = (entry) => {
    const voteRef = roundRef.child('votes').child(user.uid)
    voteRef.set({
      entryId: entry.id,
    })
  }

  const endRound = () => {
    // calculate points here
    roundRef.update({ complete: true })
  }

  console.log('my vote:', myVote)

  const votingComplete = votes.length === users.length

  return (
    <div>
      {!round.track && 'No track chosen.'}
      {round.track && <TrackPreview track={round.track} secret={!round.complete} />}
      {!round.complete && votingComplete && <button onClick={endRound}>Reveal!</button>}
      {round.complete && <Results entries={entries} users={users} votes={votes} />}
      <br />
      {round.track && !myEntry && !round.complete && < Entry onSubmit={submitEntry} />}
      {!myVote && !round.complete && <Ballot entries={entries} ready={ready} onVote={vote} />}
      <Users users={users} />
      <TrackPicker onChange={track => startNewRound({ track })} />
    </div>
  )
}

export default Room