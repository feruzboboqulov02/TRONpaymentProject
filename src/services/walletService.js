const tronWeb = require('../config/tron');

async function generateWallet() {
  const account = await tronWeb.createAccount();
  return {
    address: account.address.base58,  // TRON-адрес для платежей
    privateKey: account.privateKey    // Приватный ключ (хранить безопасно!)
  };
}

module.exports = { generateWallet };