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
      <label>RESULTS</label>

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
              <label className="votes">{entry.votes.length} votes</label>
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

  const myVote = round.votes && round.votes[user.uid]
  const entries = Object.values(round.entries || {})
  const myEntry = entries.find(e => e.authorId === user.uid)
  const votes = Object.values(round.votes || {})
  const users = Object.values(room.users || {}).filter(u => u.online)

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
      <label>Choose the correct line!</label>
      <div className="options">
        {entries.map(entry => {
          if (entry.authorId === user.uid) return null

          return (
            <div key={entry.id} className="option">
              <span className="vote" onClick={() => vote(entry)}>VOTE</span>
              {entry.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Ballot