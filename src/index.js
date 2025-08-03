import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import tronWebPromise from './config/tron.js';
import { startPaymentMonitor } from './services/paymentMonitor.js';
import walletRoutes from './routes/walletRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());

let tronWeb;

// Connect to MongoDB first
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // stop app if DB not connected
  });

// Initialize TronWeb
(async () => {
  tronWeb = await tronWebPromise;

  const address = tronWeb.defaultAddress.base58;
  console.log('Connected Address:', address);

  const balanceSun = await tronWeb.trx.getBalance(address);
  console.log('Current Balance:', balanceSun / 1_000_000, 'TRX');
})();

// Routes
app.use('/wallets', walletRoutes); // <-- Use your wallet routes

app.get('/', (req, res) => {
  res.send('TRON Payment API is running');
});

// Start server only after DB connection
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  startPaymentMonitor(); // Start background check
});
