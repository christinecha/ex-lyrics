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

    const connectionRef = firebase.database().ref('.info/connected')
    const roomRef = firebase.database().ref('rooms').child(id)
    const userRef = roomRef.child('users').child(user.uid)

    const onConnectionChange = snap => {
      if (snap.val()) {
        userRef.onDisconnect().update({ roomId: null })
        userRef.update({ uid: user.uid, displayName: user.displayName, online: true })
      }
    }

    const onRoomUpdate = snapshot => {
      const val = snapshot.val()
      val.ref = roomRef
      val.id = id
      setRoom(val)
    }

    connectionRef.on('value', onConnectionChange)
    roomRef.on('value', onRoomUpdate)
    userRef.onDisconnect().set({ online: false })

    return () => {
      userRef.update({ online: false })
      connectionRef.off('value', onConnectionChange)
      roomRef.off('value', onRoomUpdate)
      userRef.onDisconnect().cancel()
    }
  }, [id, user])


  return (
    <RoomContext.Provider value={room}>
      {children}
    </RoomContext.Provider>
  )
}

const useRoom = () => useContext(RoomContext)

export default useRoom