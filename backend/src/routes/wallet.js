const express = require('express');
const { contract, ethers } = require('../config');
const router = express.Router();

// Get balance
router.get('/balance/:userAddress/:currency', async (req, res) => {
  try {
    const { userAddress, currency } = req.params;
    
    const balance = await contract.getBalance(userAddress, currency);
    const balanceFormatted = ethers.formatEther(balance);

    res.json({
      userAddress,
      currency,
      balance: balanceFormatted,
      balanceWei: balance.toString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all balances
router.get('/balances/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const currencies = ['USDC', 'USDT', 'DAI', 'ETH'];
    
    const balances = {};
    for (const currency of currencies) {
      try {
        const balance = await contract.getBalance(userAddress, currency);
        balances[currency] = ethers.formatEther(balance);
      } catch (e) {
        balances[currency] = '0';
      }
    }

    res.json({ userAddress, balances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;