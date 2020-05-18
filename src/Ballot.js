import React, { useState, useEffect } from 'react'
import { SECRET_LINE, CORRECT_KEY } from './lib/constants'
import useRoom from "./useRoom";
import useRound from "./useRound";
import useUser from "./useUser";

const Results = ({ entries, users, votes }) => {
  const entriesWithVotes = entries
    .map(entry => {
      const entryVotes = votes.filter(v => v.entryId === entry.id)
      return {
        ...entry,
        votes: entryVotes
      }
    })
    .sort((a, b) => {
      return a.votes.length > b.votes.length ? -1 : 1
    })

  return (
    <div className='results'>
      {entriesWithVotes.map(entry => {
        const user = users.find(u => u.uid === entry.authorId) || { displayName: 'Offline User' }
        const isCorrect = entry.id === CORRECT_KEY

        return (
          <div key={entry.id} className='results-entry' data-correct={isCorrect}>
            <p>{entry.text}</p>
            <div className="info">
              <span className='byline'>
                {isCorrect ? '(Real Lyric)' : `by ${user.displayName}`}
              </span>
              {!!entry.votes.length && <label className="votes">{entry.votes.length} vote{entry.votes.length === 1 ? '' : 's'}</label>}
            </div>
          </div>
        )
      })}
    </div>
  )
}


const Ballot = ({ ready }) => {
  const user = useUser()
  const room = useRoom()
  const round = useRound()

  const usersOnline = (round.users || []).filter(u => room.users[u.uid] && room.users[u.uid].online)

  const myVote = round.votes && round.votes[user.uid]
  const entries = Object.values(round.entries || {})
  const votes = Object.values(round.votes || {})
  const users = usersOnline

  const entriesComplete = entries.length > users.length

  const vote = (entry) => {
    const voteRef = round.ref.child('votes').child(user.uid)
    voteRef.set({
      id: voteRef.key,
      voterId: user.uid,
      entryId: entry.id,
    })
  }

  if (round.complete) return (
    <Results entries={entries} users={users} votes={votes} />
  )

  if (!entriesComplete) return null

  if (myVote) return null

  return (
    <div className="ballot">
      <label>Tap to choose the correct line:</label>
      <div className="options">
        {entries
          .sort(() => Math.random() > 0.5 ? 1 : -1)
          .map(entry => {
            if (entry.authorId === user.uid) return null

            return (
              <div key={entry.id} className="option" onClick={() => vote(entry)}>
                {entry.text}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default Ballot