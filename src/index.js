import express from 'express';
import dotenv from 'dotenv';
import tronWebPromise from './config/tron.js';
import {startPaymentMonitor} from './services/paymentMonitor.js';
import WalletRoute from './routes/walletRoutes.js';


dotenv.config();
const app = express();
app.use(express.json());

let tronWeb;


(async () => {
  tronWeb = await tronWebPromise;

  const address = tronWeb.defaultAddress.base58;
  console.log('Connected Address:', address);

  const balanceSun = await tronWeb.trx.getBalance(address);
  console.log('Current Balance:', balanceSun / 1_000_000, 'TRX');
})();

// 2️⃣ Test endpoint
app.get('/', (req, res) => {
  res.send('TRON Payment API is running');
});

// 3️⃣ Create payment address (for new orders)
app.post('/api/payments/create', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!tronWeb) return res.status(500).json({ error: 'TronWeb not ready' });

    const address = tronWeb.defaultAddress.base58;

    res.json({
      orderId,
      paymentAddress: address,
      message: 'Send USDT (TRC-20) to this address'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment address' });
  }
});

// 4️⃣ Check USDT balance
app.get('/api/payments/balance/:address', async (req, res) => {
  try {
    if (!tronWeb) return res.status(500).json({ error: 'TronWeb not ready' });

    const { address } = req.params;
    const usdtContract = await tronWeb.contract().at('TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj');
    const balance = await usdtContract.balanceOf(address).call();

    res.json({
      address,
      usdtBalance: Number(balance) / 1_000_000
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// 5️⃣ Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
startPaymentMonitor();
