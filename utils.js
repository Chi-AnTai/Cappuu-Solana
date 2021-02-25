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

module.exports = {
  parseTokenAccountData
};
