import { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'

export default function Dashboard({ userAddress }) {
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userAddress) return

    const fetchBalances = async () => {
      try {
        const response = await axios.get(
          '${import.meta.env.VITE_API_URL}/wallet/balances/${userAddress}'
        )
        setBalances(response.data.balances)
      } catch (error) {
        console.error('Failed to fetch balances:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
  }, [userAddress])

  if (loading) return <div className="dashboard"><p>Loading...</p></div>

  const totalUSD = Object.entries(balances).reduce((sum, [currency, amount]) => {
    const rates = { 'USDC': 1, 'USDT': 1, 'DAI': 1'