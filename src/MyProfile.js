import React, { useState } from 'react'
import useUser from './useUser'
import firebase from './lib/firebase'

const _MyProfile = () => {
  const user = useUser()
  const [name, setName] = useState(user.displayName || '')
  const [editing, setEditing] = useState(user.displayName === 'Mystery')
  const trimmedName = name.trim()

  const updateName = (e) => {
    e.preventDefault()
    if (!trimmedName) return
    firebase.auth().currentUser.updateProfile({ displayName: trimmedName })
    setEditing(false)
  }

  return (
    <div>
      {editing && (
        <div className="edit-profile">
          <div className="inner">
            <p>Tell us your name!</p>
            <form onSubmit={updateName}>
              <label>Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} />
              <button disabled={!trimmedName}>Update</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const MyProfile = () => {
  const user = useUser()

  if (!user) return null
  return <_MyProfile />
}

export default MyProfile