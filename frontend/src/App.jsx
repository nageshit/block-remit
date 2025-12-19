import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Register from './pages/Register'
import Dashboard from './components/Dashboard'
import SendMoney from './components/SendMoney'
import './App.css'

function App() {
  const [userAddress, setUserAddress] = React.useState(null)

  return (
    <Router>
      <div className="app">
        <Header userAddress={userAddress} setUserAddress={setUserAddress} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register setUserAddress={setUserAddress} />} />
            <Route path="/dashboard" element={<Dashboard userAddress={userAddress} />} />
            <Route path="/send" element={<SendMoney userAddress={userAddress} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App