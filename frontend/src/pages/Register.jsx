import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Register.css'

export default function Register({ setUserAddress }) {
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [userAddress, setLocalUserAddress] = useState('')
  const navigate = useNavigate()

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setLocalUserAddress(accounts[0])
      } catch (error) {
        alert('Failed to connect wallet: ' + error.message)
      }
    } else {
      alert('Please install MetaMask')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!userAddress || !country) {
      alert('Please connect wallet and enter country')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        { country, userAddress }
      )

      if (response.data.success) {
        alert('Registration successful!')
        setUserAddress(userAddress)
        navigate('/dashboard')
      }
    } catch (error) {
      alert('Registration failed: ' + error.response?.data?.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register">
      <div className="register-card">
        <h2>Create Your BlockRemit Account</h2>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Country</label>
            <input
              type="text"
              placeholder="Singapore"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Wallet Address</label>
            {userAddress ? (
              <div className="connected">
                <p>{userAddress}</p>
                <span className="connected-badge">✓ Connected</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="btn-connect-wallet"
              >
                Connect MetaMask Wallet
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!userAddress || !country || loading}
            className="btn-register"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  )
}