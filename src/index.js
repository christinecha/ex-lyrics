import { getTrackLyrics, searchTracks } from './api'
import React from 'react'
import Room from './Room'
import ReactDOM from 'react-dom'
import { UserProvider } from './useUser';
import MyProfile from './MyProfile'
import { RoomProvider } from './useRoom';
import { RoundProvider } from './useRound';

const App = () => {
  const roomId = window.location.search.split('?')[1]

  if (!roomId) return null

  return (
    <UserProvider>
      <MyProfile />
      <div>
        <RoomProvider id={roomId}>
          <RoundProvider>
            <Room />
          </RoundProvider>
        </RoomProvider>
      </div>
    </UserProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))


window.getTrackLyrics = getTrackLyrics
window.searchTracks = searchTracks

