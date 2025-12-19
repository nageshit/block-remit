const express = require('express');
const { contract, ethers } = require('../config');
const router = express.Router();

// Update exchange rate
router.post('/update-rate', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, rate } = req.body;
    
    if (!fromCurrency || !toCurrency || !rate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const rateWei = ethers.parseEther(rate.toString());
    const tx = await contract.updateExchangeRate(
      fromCurrency,
      toCurrency,
      rateWei,
      { gasLimit: 100000 }
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Exchange rate updated',
      txHash: receipt.hash,
      fromCurrency,
      toCurrency,
      rate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Set transfer fee
router.post('/set-fee', async (req, res) => {
  try {
    const { feePercentage } = req.body;
    
    const tx = await contract.setTransferFee(feePercentage, { gasLimit: 100000 });
    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Fee updated',
      txHash: receipt.hash,
      feePercentage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;