import { Link } from 'react-router-dom'
import './Header.css'

export default function Header({ userAddress, setUserAddress }) {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setUserAddress(accounts[0])
      } catch (error) {
        alert('Failed to connect wallet: ' + error.message)
      }
    } else {
      alert('Please install MetaMask')
    }
  }

  const disconnectWallet = () => {
    setUserAddress(null)
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🚀 BlockRemit</h1>
        </div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/send">Send Money</Link>
        </nav>
        <div className="wallet-connect">
          {userAddress ? (
            <>
              <span className="address">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</span>
              <button onClick={disconnectWallet} className="btn-disconnect">Disconnect</button>
            </>
          ) : (
            <button onClick={connectWallet} className="btn-connect">Connect Wallet</button>
          )}
        </div>
      </div>
    </header>
  )
}