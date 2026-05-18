import { Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './pages/HomePage'
import { Lobby } from './pages/Lobby'
import { SocketProvider } from './providers/Socket'

function App() {

  return (
    <div className='h-screen'>
      <SocketProvider>
      <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path="/room/:roomId" element={<Lobby/>} />
      </Routes>
      </SocketProvider>
    </div>
  )
}

export default App
