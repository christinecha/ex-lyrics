import React, { useState } from 'react'
import useUser from './useUser'
import firebase from './lib/firebase'

const _MyProfile = ({ onUpdate }) => {
  const user = useUser()
  const [name, setName] = useState(user.displayName || '')
  const trimmedName = name.trim()

  const updateName = (e) => {
    e.preventDefault()
    if (!trimmedName) return
    firebase.auth().currentUser.updateProfile({ displayName: trimmedName }).then(() => {
      user.refetch()
    })
    onUpdate()
  }

  return (
    <div>
      <div className="edit-profile">
        <div className="inner">
          <p>Tell us your name!</p>
          <form onSubmit={updateName}>
            <label>Name</label>
            <input type="text" maxLength={20} onChange={e => setName(e.target.value)} />
            <button disabled={!trimmedName}>Update</button>
          </form>
        </div>
      </div>
    </div>
  )
}

const MyProfile = (props) => {
  const user = useUser()

  if (!user) return null
  return <_MyProfile {...props} />
}

export default MyProfile