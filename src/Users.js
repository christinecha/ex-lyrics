import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import useRoom from './useRoom'

const Users = () => {
  const room = useRoom()
  const users = Object.values(room.users || {})
  const points = room.points || {}

  return ReactDOM.createPortal((
    <div className='users-list'>
      <label className="heading">Players</label>
      <div className="users">
        {users
          .filter(u => u.online)
          .map(user => (
            <label key={user.uid}>{user.displayName || 'Anonymous'} - {points[user.uid] || 0}</label>
          ))}
      </div>
    </div>
  ), document.getElementById('footer'))
}

export default Users