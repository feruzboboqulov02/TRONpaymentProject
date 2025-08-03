import tronWebPromise from '../config/tron.js';

export async function sendTRX(toAddress, amountTRX) {
  const tronWeb = await tronWebPromise;

  // Get sender address (from derived private key)
  const fromAddress = tronWeb.defaultAddress.base58;

  console.log(`Sending ${amountTRX} TRX from ${fromAddress} to ${toAddress}...`);

  try {
    // 1 TRX = 1_000_000 SUN
    const tx = await tronWeb.transactionBuilder.sendTrx(
      toAddress,
      amountTRX * 1_000_000,
      fromAddress
    );

    // Sign the transaction
    const signedTx = await tronWeb.trx.sign(tx);

    // Broadcast the transaction
    const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

    console.log('Transaction sent:', receipt);
    return receipt;
  } catch (err) {
    console.error('TRX transfer failed:', err);
    throw err;
  }
}
