import firebase from './lib/firebase'
import React, { useContext, createContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState()

  useEffect(() => {
    firebase.auth().signInAnonymously().then(() => {
      firebase.auth().onAuthStateChanged(u => {
        console.log(u)
        setUser({
          uid: u.uid,
          displayName: u.displayName || 'Mystery'
        })
      })
    })
  }, [])


  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

const useUser = () => useContext(UserContext)

export default useUser