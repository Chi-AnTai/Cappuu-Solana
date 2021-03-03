const BufferLayout = require('buffer-layout');
const { PublicKey } = require('@solana/web3.js');

const ACCOUNT_LAYOUT = BufferLayout.struct([
  BufferLayout.blob(32, 'mint'),
  BufferLayout.blob(32, 'owner'),
  BufferLayout.nu64('amount'),
  BufferLayout.blob(93),
]);

// Ref: https://github.com/project-serum/spl-token-wallet/blob/7389ad260a6959dc8b2fe08576f7b95e1648cdc0/src/utils/tokens/data.js#L17
function parseTokenAccountData(data) {
  const { mint, owner, amount } = ACCOUNT_LAYOUT.decode(data);
  return {
    mint: new PublicKey(mint),
    owner: new PublicKey(owner),
    amount,
  };
};

// Ref: https://github.com/project-serum/spl-token-wallet/blob/5ca3e3d90366be74383ec04aaa4cfbdb3ef77e22/src/utils/tokens/index.js#L74
async function signAndSendTransaction(
  connection,
  transaction,
  wallet,
  signers,
  skipPreflight = false,
) {
  transaction.recentBlockhash = (
    await connection.getRecentBlockhash('max')
  ).blockhash;
  transaction.setSigners(
    // fee payed by the wallet owner
    wallet.publicKey,
    ...signers.map((s) => s.publicKey),
  );

  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  transaction.partialSign(wallet);
  const rawTransaction = transaction.serialize();
  return await connection.sendRawTransaction(rawTransaction, {
    skipPreflight,
    preflightCommitment: 'single',
  });
};

module.exports = {
  parseTokenAccountData,
  signAndSendTransaction,
  ACCOUNT_LAYOUT
};
