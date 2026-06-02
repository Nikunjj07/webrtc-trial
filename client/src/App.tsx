import { Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { Lobby } from './pages/Lobby'
import { SocketProvider } from './providers/Socket'
import { PeerProvider } from './providers/Peer'

function App() {

  return (
    <div className='h-screen'>
      <SocketProvider>
        <PeerProvider>
          <Routes>
              <Route path='/' element={<HomePage/>}/>
              <Route path="/room/:roomId" element={<Lobby/>} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  )
}

export default App
