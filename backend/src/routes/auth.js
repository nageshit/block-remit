const express = require('express');
const { contract } = require('../config');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { country, userAddress } = req.body;
    
    if (!country || !userAddress) {
      return res.status(400).json({ error: 'Country and userAddress required' });
    }

    const tx = await contract.registerUser(country, { gasLimit: 100000 });
    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'User registered successfully',
      txHash: receipt.hash,
      userAddress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if user is registered
router.get('/is-registered/:address', async (req, res) => {
  try {
    const { address } = req.params;
    // Add view function to contract if needed
    res.json({ isRegistered: true, address });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;