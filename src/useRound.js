import firebase from './lib/firebase'
import React, { useContext, createContext, useState, useEffect } from 'react'
import useRoom from './useRoom'

const RoundContext = createContext()

export const RoundProvider = ({ id, children }) => {
  const [round, setRound] = useState()
  const room = useRoom() || {}

  useEffect(() => {
    if (!room.activeRound) {
      setRound()
      return
    }

    const newRound = room.rounds[room.activeRound]
    newRound.ref = room.ref.child('rounds').child(room.activeRound)
    setRound(newRound)

    newRound.ref.on('value', snapshot => {
      const val = snapshot.val()
      val.ref = newRound.ref
      setRound(val)
    })

    return () => {
      newRound.ref.off()
    }
  }, [room.activeRound])

  return (
    <RoundContext.Provider value={round}>
      {children}
    </RoundContext.Provider>
  )
}

const useRound = () => useContext(RoundContext)

export default useRound