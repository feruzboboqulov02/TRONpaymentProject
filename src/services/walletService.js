import tronWebPromise from '../config/tron.js';

export async function generateWallet() {
  const tronWeb = await tronWebPromise;
  const account = await tronWeb.createAccount();

  return {
    address: account.address.base58,  // TRON address
    privateKey: account.privateKey    // Private key (keep safe!)
  };
}
