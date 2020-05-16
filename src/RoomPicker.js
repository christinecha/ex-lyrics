import firebase from './lib/firebase'
import { withRouter } from 'react-router-dom'
import React, { useContext, createContext, useState, useEffect } from 'react'
import useUser from './useUser';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'

const randLetter = () => LETTERS[Math.floor(Math.random() * LETTERS.length)]

const generateNewId = (rooms) => {
  const roomIds = rooms.map(r => r.id)

  const suggested = new Array(4).fill('').map(randLetter).join('')

  if (roomIds.indexOf(suggested) > -1) {
    return generateNewId(rooms)
  }

  return suggested
}

const CreateRoom = () => {
  const [name, setName] = useState('')
  return (
    <div>
      <input type="text" onChange={e => setName(e.target.value)} />
      <button>Create</button>
    </div>
  )
}

const RoomPicker = ({ history }) => {
  const user = useUser()
  const [rooms, setRooms] = useState()
  const roomsRef = firebase.database().ref('rooms')

  useEffect(() => {
    roomsRef.on('value', (snap) => {
      const val = snap.val()
      const newRooms = Object.keys(val).map(key => ({
        ...val[key],
        id: key
      }))

      setRooms(newRooms)
    })
  }, [])

  if (!rooms) return null

  const createNew = () => {
    const id = generateNewId(rooms)
    roomsRef.child(id).set({ id, creatorId: user.uid })
    history.push(`/room/${id}`)
  }

  return (
    <div>
      <div>
        <h1>Ex Lyrics</h1>
        <p>A new multiplayer game for creative minds. Inspired by <a href="https://oxfordgames.co.uk/shop/ex-libris/" target="_blank" rel="noopener noreferrer">Ex Libris</a> and brought to the internet by <a href="https://www.christinecha.com/" target="_blank" rel="noopener noreffer">Christine Cha</a>. </p>
        <br />
        <p>
          For each new round, you'll see an excerpt of a song's lyrics. Fill in the missing line to submit your entry. Don't worry - it doesn't have to be right, just believeable! Once everyone submits their entries, you'll vote for which one you think is the correct line.
        </p>
        <br />
        <p>
          You get 1 point for each vote your line gets, as well as 1 point if you guess the correct line.
        </p>
        <br />
        <br />
      </div>
      <button onClick={createNew}>Start a New Game</button>
    </div>
  )
}

export default withRouter(RoomPicker)