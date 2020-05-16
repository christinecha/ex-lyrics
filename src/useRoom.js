import firebase from './lib/firebase'
import React, { useContext, createContext, useState, useEffect } from 'react'
import useUser from './useUser'

const RoomContext = createContext()

export const RoomProvider = ({ id, children }) => {
  const [room, setRoom] = useState()
  const user = useUser()

  useEffect(() => {
    setRoom()

    if (!user) return

    const roomRef = firebase.database().ref('rooms').child(id)
    const userRef = roomRef.child('users').child(user.uid)
    userRef.update({ ...user, online: true })

    roomRef.on('value', snapshot => {
      const val = snapshot.val()
      val.ref = roomRef
      val.id = id
      setRoom(val)
    })

    window.addEventListener('online', () => {
      userRef.update({ online: true })
    });

    userRef.onDisconnect().set({ online: false })
  }, [id, user])


  return (
    <RoomContext.Provider value={room}>
      {children}
    </RoomContext.Provider>
  )
}

const useRoom = () => useContext(RoomContext)

export default useRoom