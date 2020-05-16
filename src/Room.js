import React, { useState, useEffect } from 'react'
import firebase from './lib/firebase'
import useUser from './useUser'
import Ballot from './Ballot'
import TrackPicker from './TrackPicker'
import { SECRET_LINE, CORRECT_KEY } from './lib/constants'
import useRoom from './useRoom';
import useRound from './useRound';

// Pick a random song.
// Show lyrics of song
// Users guess following three words
// Show following three words
// Vote

const ADMIN = !!localStorage.getItem('ADMIN')

const LyricsDisplay = ({ lyrics, showLine, entryForm }) => {
  return (
    <div className='lyrics'>
      <div>...</div>
      {lyrics.map((line, i) => {
        // const words = line.split(/\s/)
        const isMystery = showLine && i === SECRET_LINE

        return (
          <div key={i}>
            {!isMystery && line}
            {isMystery && entryForm}
          </div>
        )
      })}
      <div>...</div>
    </div>
  )
}

const TrackPreview = ({ track, showLine, entryForm }) => {
  if (!track) return 'No track chosen.'

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

      {track.lyrics && <LyricsDisplay lyrics={track.lyrics} showLine={showLine} entryForm={entryForm} />}
    </div>
  )
}

const Entry = ({ onSubmit }) => {
  const [entry, setEntry] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(entry)
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <input type="text" placeholder="Type your line here" value={entry} onChange={(e) => setEntry(e.target.value)} />
      <button disabled={!entry.trim()}>Submit</button>
    </form>
  )
}

const Users = ({ users }) => {
  const round = useRound()
  const points = round.points || {}

  return (
    <div className='users-list'>
      In this room:
      {users
        .map(user => (
          <label key={user.uid}>{user.displayName} ({points[user.uid] || 0})</label>
        ))}
    </div>
  )
}


const Room = () => {
  const user = useUser()
  const room = useRoom()
  const round = useRound()

  const startNewRound = ({ track }) => {
    const newRoundRef = room.ref.child('rounds').push()
    newRoundRef.update({
      track,
      entries: {
        [CORRECT_KEY]: {
          id: CORRECT_KEY,
          text: track.lyrics[SECRET_LINE],
        }
      }
    })
    room.ref.update({ activeRound: newRoundRef.key })
  }

  if (!round) {
    console.warn('No round found.')
    return (
      <>
        {ADMIN && <TrackPicker onChange={track => startNewRound({ track })} />}
      </>

    )
  }

  const submitEntry = (entry) => {
    console.log(entry)
    // DO NOT ALLOW MULTIPLE ENTRIES
    const entryRef = round.ref.child('entries').push()
    entryRef.set({
      id: entryRef.key,
      text: entry,
      authorId: user.uid,
    })
  }

  const myVote = round.votes && round.votes[user.uid]
  const entries = Object.values(round.entries || {})
  const myEntry = entries.find(e => e.authorId === user.uid)
  const votes = Object.values(round.votes || {})
  const users = Object.values(room.users || {}).filter(u => u.online)
  const entriesComplete = entries.length > users.length
  console.log(entries.length, 'entries submitted')
  console.log(votes.length, 'votes submitted')


  const endRound = () => {
    const prevPoints = room.points || {}

    // calculate points here
    const allVotedEntries = votes.map(v => {
      const entry = round.entries[v.entryId]

      return {
        authorId: entry.authorId,
        voterId: v.voterId
      }
    })

    const points = { ...prevPoints }

    // you get a point if you guess the correct line
    allVotedEntries.forEach(v => {
      const winner = v.authorId || v.voterId
      points[winner] = points[winner] || 0
      points[winner] += 1
    })

    round.ref.update({ complete: true, points })
  }

  console.log('my vote:', myVote)

  const votingComplete = votes.length >= users.length

  let state
  if (!round.complete) {
    if (!entriesComplete) state = 'Waiting for entries'
    else if (!votingComplete) state = 'Waiting for votes'
    else state = 'Voting complete! Reveal!'
  } else {
    state = 'Round is over'
  }

  return (
    <div className="room">
      <label>Round {Object.keys(room.rounds).length}</label>
      <div className="status">{state}</div>
      <Users users={users} />
      <TrackPreview
        track={round.track}
        showLine={!round.complete}
        entryForm={myEntry ? '_________________________________' : <Entry onSubmit={submitEntry} />}
      />
      {ADMIN && !round.complete && <button onClick={endRound}>Reveal!</button>}
      <br />
      <Ballot />
      {ADMIN && <TrackPicker onChange={track => startNewRound({ track })} />}
    </div>
  )
}

export default Room