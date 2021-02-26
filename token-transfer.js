// import solanaWeb3 from '@solana/web3.js';
const solanaWeb3 = require('@solana/web3.js');
const { hdkey } = require('ethereumjs-wallet');
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key')
const nacl = require('tweetnacl');
const { parseTokenAccountData } = require('./utils');
const { createAndTransferToAccount } = require('./tokens');

// Get account
const phrase = "stereo mango fantasy bar vague clerk maze diet imitate fancy snap slab marble magic sugar feature student sunset pioneer sugar carpet path path rich";
// const phrase = "rose rocket invest real refuse margin festival danger anger border idle brown";
const seed = bip39.mnemonicToSeedSync(phrase);

// Ethereum
// const masterWallet = hdkey.fromMasterSeed(seed);
// const keyPair1 = masterWallet.derivePath("m/44'/60'/0'/0/0");
// const wallet1 = keyPair1.getWallet();
// console.log(wallet1.getAddressString());
// console.log(wallet1.getChecksumAddressString());

// Solana
// Ref：https://github.com/project-serum/spl-token-wallet/blob/3fc7be09f1dbefe2b90a20e7a45dcb0260ca2276/src/utils/walletProvider/localStorage.js
const wtf = derivePath("m/44'/501'/0'/0'", seed).key;
const account = new solanaWeb3.Account(nacl.sign.keyPair.fromSeed(wtf).secretKey);
console.log(account.publicKey.toBase58()); // 81SqLJ5m5F7Fjc2rTFkcGtp5pafZYCbTx4aUPSq39zrU

// Get balance of SOL
const url = 'http://testnet.solana.com';
const provider = new solanaWeb3.Connection(url);
provider.getBalance(account.publicKey).then(balance => {
    console.log(`${account.publicKey} has a balance of ${balance}`); // 10
});

// Get balance of token TEST4n
// Ref：https://github.com/project-serum/spl-token-wallet/blob/5ca3e3d90366be74383ec04aaa4cfbdb3ef77e22/src/utils/wallet.js#L416
const tokenAccount = "6T3FhNYuWTYwDpLyXR2WRFHYvgMjPUn8H9sGcQf9iUcY"; // My token account of 81SqLJ5m5F7Fjc2rTFkcGtp5pafZYCbTx4aUPSq39zrU
const decimals = 2;
const tokenAccountPublicKey = new solanaWeb3.PublicKey(tokenAccount);
provider.getAccountInfo(tokenAccountPublicKey).then(accountInfo => {
    const { mint, owner, amount } = parseTokenAccountData(accountInfo.data);
    const tokenBalance = amount / (10 ** decimals);
    console.log(`${tokenAccount} has a balance of ${tokenBalance} TEST4n`);
});

// Send token TEST4n
// Ref：https://github.com/project-serum/spl-token-wallet/blob/5ca3e3d90366be74383ec04aaa4cfbdb3ef77e22/src/utils/tokens/index.js#L296
// If the destination account doesn't have a token account, I need to create a token account for it, and then I can tranfer the token
const destinationPublicKey = new solanaWeb3.PublicKey('6Ju43Kks6Z4aQLmCjGafov8cJB4qipVFw7Tmx4htpvAr');
const tokenPublicKey = new solanaWeb3.PublicKey('4n4Cv5652oHow4hbekUuB6MXwShtbJViQiezQqZJPiK3'); // The token address
const amount = 1 * (10 ** decimals);
createAndTransferToAccount({
    connection: provider,
    owner: account,
    destinationPublicKey,
    sourcePublicKey: tokenAccountPublicKey,
    amount,
    memo: null,
    mint: tokenPublicKey,
});
