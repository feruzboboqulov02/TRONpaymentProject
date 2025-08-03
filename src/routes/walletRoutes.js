const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet.js');
const { generateWallet } = require('../services/walletService');

// POST /wallets/create
router.post('/create', async (req, res) => {
  try {
    const { orderId, ttlMinutes = 60 } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });

    const walletData = await generateWallet();
    const ttl = new Date(Date.now() + ttlMinutes * 60000);

    const wallet = await Wallet.create({
      orderId,
      address: walletData.address,
      privateKey: walletData.privateKey,
      ttl
    });

    res.json({ success: true, wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});

module.exports = router;
