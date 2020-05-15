import React, { useState, useEffect } from 'react'
import firebase from './lib/firebase'
import useUser from './useUser'
import TrackPicker from './TrackPicker'
import { SECRET_LINE, CORRECT_KEY } from './lib/constants'

// Pick a random song.
// Show lyrics of song
// Users guess following three words
// Show following three words
// Vote



const LyricsDisplay = ({ lyrics, showLine, entryForm }) => {
  return (
    <div className='lyrics'>
      <div>...</div>
      {lyrics.map((line, i) => {
        // const words = line.split(/\s/)
        const isMystery = showLine && i === SECRET_LINE

        return (
          <div>
            {!isMystery && line}
            {isMystery && entryForm}
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

const TrackPreview = ({ track, showLine, entryForm }) => {
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
      <input type="text" value={entry} onChange={(e) => setEntry(e.target.value)} />
      <button disabled={!entry.trim()}>Submit Entry</button>
    </form>
  )
}

const Ballot = ({ entries, ready, onVote }) => {
  return (
    <div className="ballot">
      <label>Choose the correct line!</label>
      <div className="options">
        {entries.map(entry => {
          return (
            <div className="option">
              <span className="vote" onClick={() => onVote(entry)}>VOTE</span>
              {entry.text}
            </div>
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
          <p>{user.displayName}</p>
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
        const user = users.find(u => u.uid === entry.userId) || { displayName: 'Offline User' }
        const isCorrect = entry.id === CORRECT_KEY

        return (
          <div className='results-entry' data-correct={isCorrect}>
            <p>{entry.text}</p>
            <p className='byline'>[{isCorrect ? 'CORRECT' : user.displayName}]</p>
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

    window.addEventListener('online', () => {
      userRef.update({ online: true })
    });

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
      userId: user.uid,
    })
  }

  console.log(room, round)
  const myVote = round.votes && round.votes[user.uid]
  const entries = Object.values(round.entries || {})
  const myEntry = entries.find(e => e.userId === user.uid)
  const votes = Object.values(round.votes || {})
  const users = Object.values(room.users || {}).filter(u => u.online)
  const entriesComplete = entries.length > users.length

  console.log(entries, users)

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

  const votingComplete = votes.length >= users.length

  let state
  if (!round.complete) {
    if (!entriesComplete) state = 'Waiting for entries'
    else if (!votingComplete) state = 'Waiting for votes'
    else state = 'Round is over'
  } else {
    state = 'Round is over'
  }

  return (
    <div className="room">
      <label>Round {Object.keys(room.rounds).length}</label>
      <div className="status">{state}</div>
      {!round.track && 'No track chosen.'}
      {round.track && (
        <TrackPreview
          track={round.track}
          showLine={!votingComplete}
          entryForm={myEntry ? '_________________________________' : <Entry onSubmit={submitEntry} />}
        />
      )}
      {/* {!round.complete && votingComplete && <button onClick={endRound}>Reveal!</button>} */}
      {votingComplete && <Results entries={entries} users={users} votes={votes} />}
      <br />
      {!myVote && !round.complete && entriesComplete && <Ballot entries={entries} onVote={vote} />}
      <Users users={users} />
      <TrackPicker onChange={track => startNewRound({ track })} />
    </div>
  )
}

export default Room