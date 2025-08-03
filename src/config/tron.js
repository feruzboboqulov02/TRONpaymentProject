// src/config/tron.js
import * as TronWeb from 'tronweb';
import bip39 from 'bip39';
import hdkey from 'hdkey';
import dotenv from 'dotenv';
dotenv.config();

async function createTronWeb() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) throw new Error('Missing MNEMONIC in .env');

  // 1. Derive private key from mnemonic
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const root = hdkey.fromMasterSeed(seed);
  const node = root.derive("m/44'/195'/0'/0/0");

  const privateKey = node.privateKey.toString('hex');
  console.log('Derived Private Key:', privateKey);

  // 2. Use the constructor correctly for v6
  const tronWeb = new TronWeb.TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || '' },
    privateKey
  });

  console.log('TRON Address:', tronWeb.address.fromPrivateKey(privateKey));
  return tronWeb;
}

export default await createTronWeb();
