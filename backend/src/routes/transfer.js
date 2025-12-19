const express = require('express');
const { contract, ethers } = require('../config');
const router = express.Router();

// Calculate transfer
router.post('/calculate', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount } = req.body;
    
    if (!fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const amountWei = ethers.parseEther(amount.toString());
    const [recipientAmount, fee] = await contract.calculateTransferAmount(
      fromCurrency,
      toCurrency,
      amountWei
    );

    res.json({
      senderAmount: amount,
      recipientAmount: ethers.formatEther(recipientAmount),
      fee: ethers.formatEther(fee),
      fromCurrency,
      toCurrency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initiate transfer
router.post('/initiate', async (req, res) => {
  try {
    const { recipientAddress, fromCurrency, toCurrency, amount } = req.body;
    
    if (!recipientAddress || !fromCurrency || !toCurrency || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const amountWei = ethers.parseEther(amount.toString());
    const tx = await contract.initiateTransfer(
      recipientAddress,
      fromCurrency,
      toCurrency,
      amountWei,
      { gasLimit: 300000 }
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      message: 'Transfer completed',
      txHash: receipt.hash,
      amount,
      fromCurrency,
      toCurrency,
      recipient: recipientAddress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transfer details
router.get('/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    
    const transfer = await contract.getTransfer(transferId);

    res.json({
      transferId,
      sender: transfer[1],
      recipient: transfer[2],
      fromCurrency: transfer[3],
      toCurrency: transfer[4],
      senderAmount: ethers.formatEther(transfer[5]),
      recipientAmount: ethers.formatEther(transfer[6]),
      fee: ethers.formatEther(transfer[7]),
      timestamp: new Date(transfer[8] * 1000),
      status: transfer[9]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;