import { nanoid } from 'nanoid'
import React, { useContext, createContext, useState, useEffect } from 'react'
import firebase from './lib/firebase'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [fetchKey, setFetchKey] = useState()
  const [user, setUser] = useState()

  useEffect(() => {
    firebase.auth().signInAnonymously().then(() => {
      firebase.auth().onAuthStateChanged(u => {
        setUser({
          uid: u.uid,
          displayName: u.displayName,
          refetch: () => setFetchKey(nanoid())
        })
      })
    })
  }, [])

  useEffect(() => {
    if (!fetchKey) return

    const { currentUser } = firebase.auth()

    if (!currentUser) {
      setUser()
      return
    }

    setUser({
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      refetch: () => setFetchKey(nanoid())
    })
  }, [fetchKey])


  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

const useUser = () => useContext(UserContext)

export default useUser