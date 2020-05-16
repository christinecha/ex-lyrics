import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useUser from './useUser'
import MyProfile from './MyProfile'

const Layout = ({ children }) => {
  const user = useUser()
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (!user) return
    setShowProfile(!user.displayName)
  }, [user])

  return (
    <div>
      <header>
        <Link to="/">Ex Lyrics</Link>

        <div className="user-info">
          {user && user.displayName}
          <button data-plain onClick={() => setShowProfile(true)}>Edit</button>
        </div>
      </header>

      <main>
        {children}
      </main>

      {showProfile && <MyProfile onClose={() => setShowProfile(false)} />}
    </div>
  )
}

export default Layout