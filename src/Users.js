import React, { useState, useEffect } from 'react'
import useRoom from './useRoom'

const Users = () => {
  const room = useRoom()
  const users = Object.values(room.users || {})
  const points = room.points || {}

  return (
    <div className='users-list'>
      <label className="heading">Players</label>
      <div className="users">
        {users
          .filter(u => u.online)
          .map(user => (
            <label key={user.uid}>{user.displayName || 'Anonymous'} - {points[user.uid] || 0}<span className="pts">pts</span></label>
          ))}
      </div>
    </div>
  )
}

export default Users