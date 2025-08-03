import express from 'express';
import Wallet from '../models/wallet.js';
import { generateWallet } from '../services/walletService.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { orderId, ttlMinutes = 60, amount } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId is required' });
    if (!amount || amount <= 0) return res.status(400).json({ error: 'amount is required and must be > 0' });

    const walletData = await generateWallet();
    const ttl = new Date(Date.now() + ttlMinutes * 60000);

    const wallet = await Wallet.create({
      orderId,
      address: walletData.address,
      privateKey: walletData.privateKey,
      ttl,
      expectedAmount: amount  // 🔹 Сохраняем ожидаемую сумму
    });

    res.json({ success: true, wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create wallet' });
  }
});



router.get('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const wallet = await Wallet.findOne({ orderId }).lean();

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    res.json({
      orderId: wallet.orderId,
      address: wallet.address,
      status: wallet.status,
      usdtReceived: wallet.usdtReceived,
      ttl: wallet.ttl,
      createdAt: wallet.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get wallet status' });
  }
});

export default router;
