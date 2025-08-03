import Wallet from '../models/wallet.js';
import tronWebPromise from '../config/tron.js';
import { sendPaymentNotification } from './emailService.js';

const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';
const TRONGRID_API = 'https://api.trongrid.io/v1/accounts'; 

async function checkWalletsForPayments() {
  const tronWeb = await tronWebPromise;
  const now = new Date();

  
  const wallets = await Wallet.find({ status: 'pending', ttl: { $gt: now } });

  for (const wallet of wallets) {
    try {
      
      const url = `${TRONGRID_API}/${wallet.address}/transactions/trc20?limit=20&contract_address=${USDT_CONTRACT}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.data || data.data.length === 0) continue;

      for (const tx of data.data) {
        
        if (!tx.confirmed) continue;

        
        if (tx.to !== wallet.address) continue;

        
        const amount = Number(tx.value) / 1_000_000;

        
        if (!wallet.expectedAmount || amount >= wallet.expectedAmount) {
          console.log(`💰 Оплата ${amount} USDT для ${wallet.address}`);
          wallet.status = 'paid';
          wallet.usdtReceived = amount;
          await wallet.save();

          
          await sendPaymentNotification(wallet.orderId, wallet.address, amount);
          break; 
        } else {
          console.log(`Платёж ${amount} USDT для ${wallet.address}, но требуется ${wallet.expectedAmount}`);
        }
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
