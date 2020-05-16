import { getTrackLyrics, searchTracks, getRichSync } from './api'
import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'
import Room from './Room'
import RoomPicker from './RoomPicker'
import ReactDOM from 'react-dom'
import { UserProvider } from './useUser';
import MyProfile from './MyProfile'
import { RoomProvider } from './useRoom';
import { RoundProvider } from './useRound';

const App = () => {
  return (
    <UserProvider>
      <MyProfile />

      <Router>
        <Route exact path="/" component={RoomPicker} />
        <Route
          path="/room/:id"
          component={({ match }) => (
            <RoomProvider id={match.params.id}>
              <RoundProvider>
                <Room />
              </RoundProvider>
            </RoomProvider>
          )}
        />
      </Router>
    </UserProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))

window.getRichSync = getRichSync