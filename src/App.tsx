import { useState } from 'react'
import './App.css'
import { words } from './words'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <div className="gameLayer">
        <div className="title">Wordle Clone</div>
        <div className="wordGrid">
          <div className="word">
            <div className="letter">W</div>
            <div className="letter">O</div>
            <div className="letter">R</div>
            <div className="letter">D</div>
            <div className="letter">S</div>
          </div>
          <div className="word">
            <div className="letter">G</div>
            <div className="letter">R</div>
            <div className="letter">I</div>
            <div className="letter">D</div>
            <div className="letter">S</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
