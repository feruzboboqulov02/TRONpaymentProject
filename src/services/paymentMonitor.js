import Wallet from '../models/Wallet.js';
import tronWebPromise from '../config/tron.js';

const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

async function checkWalletsForPayments() {
  const tronWeb = await tronWebPromise;

  const now = new Date();
  const wallets = await Wallet.find({
    status: 'pending',
    ttl: { $gt: now }
  });

  for (const wallet of wallets) {
    try {
      const contract = await tronWeb.contract().at(USDT_CONTRACT);
      const balance = await contract.balanceOf(wallet.address).call();
      const usdtBalance = Number(balance) / 1_000_000;

      if (usdtBalance > 0) {
        console.log(`Payment detected for ${wallet.address}: ${usdtBalance} USDT`);

        wallet.status = 'paid';
        wallet.usdtReceived = usdtBalance;
        await wallet.save();

        
      }
    } catch (err) {
      console.error(`Error checking wallet ${wallet.address}:`, err.message);
    }
  }
}

export function startPaymentMonitor() {
  console.log('Payment monitor started...');
  setInterval(checkWalletsForPayments, 30_000);
}
