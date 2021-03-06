import React, { useState, useEffect } from 'react'
import firebase from './lib/firebase'
import useUser from './useUser'
import Ballot from './Ballot'
import TrackPicker from './TrackPicker'
import { SECRET_LINE, CORRECT_KEY } from './lib/constants'
import useRoom from './useRoom';
import useRound from './useRound';
import Users from './Users'

const LyricsDisplay = ({ lyrics, showLine, entryForm }) => {
  return (
    <div className='lyrics'>
      <div>...</div>
      {lyrics.map((line, i) => {
        // const words = line.split(/\s/)
        const isMystery = !showLine && i === SECRET_LINE
        const isRevealed = showLine && i === SECRET_LINE

        return (
          <div className="line" data-revealed={isRevealed} data-hidden={isMystery} key={i}>
            {!isMystery && line}
            {isMystery && entryForm}
          </div>
        )
      })}
    </div>
  )
}

const TrackPreview = ({ track, showLine, entryForm }) => {
  if (!track) return 'No track chosen.'

  return (
    <div className='track-preview'>
      <h3 className='track-name'>{track.track_name}</h3>
      <label className='track-album'>Album: {track.album_name}</label>
      <label className='track-artist'>Artist: {track.artist_name}</label>
      <p className='track-genres'>
        {track.genres && track.genres.map(genre => (
          <label key={genre}>{genre}</label>
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

const startNewRound = ({ room, track }) => {
  const users = Object.values(room.users || {}).filter(u => u.online)
  const newRoundRef = room.ref.child('rounds').push()
  newRoundRef.update({
    track,
    users,
    entries: {
      [CORRECT_KEY]: {
        id: CORRECT_KEY,
        text: track.lyrics[SECRET_LINE],
      }
    }
  })
  room.ref.update({ activeRound: newRoundRef.key })
}

const NoRound = () => {
  const user = useUser()
  const room = useRoom()

  const isAdmin = room.creatorId === user.uid

  return (
    <div className="round">
      <div className="header">
        <div className="status">Waiting for the first round to start...</div>
      </div>
      <br />
      <label>Room Code</label>
      <h1>{room.id.toUpperCase()}</h1>
      <br />
      {isAdmin && <TrackPicker onChange={track => startNewRound({ room, track })} />}
    </div>
  )
}

const Round = () => {
  const user = useUser()
  const room = useRoom()
  const round = useRound()

  const isAdmin = room.creatorId === user.uid
  const usersOnline = (round.users || []).filter(u => room.users[u.uid] && room.users[u.uid].online)


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
  const users = usersOnline
  const entriesComplete = entries.length > users.length
  console.log(entries.length, 'entries submitted')
  console.log(votes.length, 'votes submitted')


  useEffect(() => {
    if (!isAdmin) return
    if (votes.length >= users.length) {
      endRound()
    }
  }, [isAdmin, votes, users])


  const endRound = () => {
    if (round.complete) return

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

    round.ref.update({ complete: true })
    room.ref.update({ points })
  }

  console.log('my vote:', myVote)

  const votingComplete = votes.length >= users.length

  if (!usersOnline.find(u => u.uid === user.uid)) {
    return <p>Round already started. Please wait until the next one starts.</p>
  }


  let state
  if (!round.complete) {
    if (!entriesComplete) state = 'Waiting for entries...'
    else if (!votingComplete) state = 'Waiting for votes...'
    else state = 'Voting complete! Reveal!'
  } else {
    state = 'Round is over'
  }

  return (
    <div className="round">
      {isAdmin && <TrackPicker onChange={track => startNewRound({ track, room })} />}
      {/* {isAdmin && !round.complete && (
        <>
          <button onClick={endRound}>Reveal</button>
          <br />
          <br />
        </>
      )} */}

      <div className="header">
        <label className="title">Round {Object.keys(room.rounds).length}</label>
        <div className="status">{state}</div>
      </div>

      <Ballot />
      <TrackPreview
        track={round.track}
        showLine={round.complete}
        entryForm={myEntry ? '~ mystery line ~' : <Entry onSubmit={submitEntry} />}
      />
    </div>
  )
}

const Room = () => {
  const user = useUser()
  const room = useRoom()
  const round = useRound()

  if (!user || !room) return null

  const admin = room.users && room.users[room.creatorId]
  const hasAdmin = admin && admin.online

  if (!hasAdmin) return (
    <div>
      The admin of this room has left. Please wait or start a new room.
    </div>
  )

  return (
    <div className="room">
      {round && <label>Room Code: {room.id}</label>}
      <Users />

      {round && <Round />}
      {!round && <NoRound />}
    </div>
  )
}

export default Room