import Wallet from '../models/wallet.js';
import tronWebPromise from '../config/tron.js';

const USDT_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

async function checkWalletsForPayments() {
  const tronWeb = await tronWebPromise;
  const now = new Date();

  // Берём все активные кошельки
  const wallets = await Wallet.find({ status: 'pending', ttl: { $gt: now } });

  for (const wallet of wallets) {
    try {
      // Получаем последние транзакции по адресу
      const transactions = await tronWeb.trx.getTransactionsRelated(wallet.address, 'to');

      for (const tx of transactions) {
        // 1️⃣ Проверяем успешную транзакцию
        if (!tx.ret || tx.ret[0].contractRet !== 'SUCCESS') continue;

        // 2️⃣ Ищем вызов смарт-контракта
        const contractData = tx.raw_data?.contract[0];
        if (!contractData || contractData.type !== 'TriggerSmartContract') continue;

        // 3️⃣ Проверяем, что это USDT контракт
        const value = contractData.parameter.value;
        if (value.contract_address?.toUpperCase() !== USDT_CONTRACT.toUpperCase()) continue;

        // 4️⃣ Конвертируем сумму в USDT
        const amount = Number(value.amount) / 1_000_000;

        // 5️⃣ Помечаем как оплаченный
        console.log(`Оплата ${amount} USDT для ${wallet.address}`);
        wallet.status = 'paid';
        wallet.usdtReceived = amount;
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
