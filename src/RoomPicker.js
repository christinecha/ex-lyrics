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
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
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
      <button onClick={createNew}>Create New Room</button>

      {rooms.map(room => {
        return (
          <div>{room.id}</div>
        )
      })}
    </div>
  )
}

export default withRouter(RoomPicker)