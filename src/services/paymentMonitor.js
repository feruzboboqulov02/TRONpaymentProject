const Wallet = require('../models/wallet.js');
const tronWebPromise = require('../config/tron.js');

const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

async function checkWalletsForPayments() {
  const tronWeb = await tronWebPromise;

  // Get all active pending wallets
  const now = new Date();
  const wallets = await Wallet.find({
    status: 'pending',
    ttl: { $gt: now }
  });

  for (const wallet of wallets) {
    try {
      const contract = await tronWeb.contract().at(USDT_CONTRACT);
      const balance = await contract.balanceOf(wallet.address).call();
      const usdtBalance = Number(balance) / 1_000_000; // 6 decimals

      if (usdtBalance > 0) {
        console.log(`Payment detected for ${wallet.address}: ${usdtBalance} USDT`);

        wallet.status = 'paid';
        wallet.usdtReceived = usdtBalance;
        await wallet.save();

        // TODO: trigger order update or callback here
      }
    } catch (err) {
      console.error(`Error checking wallet ${wallet.address}:`, err.message);
    }
  }
}

function startPaymentMonitor() {
  console.log('⏳ Payment monitor started...');
  setInterval(checkWalletsForPayments, 30_000); // check every 30 seconds
}

module.exports = { startPaymentMonitor };
