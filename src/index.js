import { getTrackLyrics, searchTracks } from './api'
import React from 'react'
import Room from './Room'
import ReactDOM from 'react-dom'
import { UserProvider } from './useUser';

const App = () => {
  return (
    <UserProvider>
      <div>
        <Room id='test' />
      </div>
    </UserProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))


window.getTrackLyrics = getTrackLyrics
window.searchTracks = searchTracks

