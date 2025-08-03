import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  address: { type: String, required: true },
  privateKey: { type: String, required: true },
  ttl: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  usdtReceived: { type: Number, default: 0 }
});

const Wallet = mongoose.model('Wallet', WalletSchema);
export default Wallet;
