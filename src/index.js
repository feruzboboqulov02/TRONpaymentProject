import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import tronWebPromise from './config/tron.js';
import { startPaymentMonitor } from './services/paymentMonitor.js';
import walletRoutes from './routes/walletRoutes.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use('/api/payments', walletRoutes);

let tronWeb;


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(' MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); 
  });


(async () => {
  tronWeb = await tronWebPromise;

  const address = tronWeb.defaultAddress.base58;
  console.log('Connected Address:', address);

  const balanceSun = await tronWeb.trx.getBalance(address);
  console.log('Current Balance:', balanceSun / 1_000_000, 'TRX');
})();


app.use('/wallets', walletRoutes); 

app.get('/', (req, res) => {
  res.send('TRON Payment API is running');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startPaymentMonitor(); 
});
