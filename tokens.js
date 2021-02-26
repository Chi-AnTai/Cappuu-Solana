const { Account, Transaction, SystemProgram } = require('@solana/web3.js');
const { assertOwner, initializeAccount, createTransferBetweenSplTokenAccountsInstruction, TOKEN_PROGRAM_ID } = require('./instructions');
const { ACCOUNT_LAYOUT, signAndSendTransaction } = require('./utils');

// Ref：https://github.com/project-serum/spl-token-wallet/blob/5ca3e3d90366be74383ec04aaa4cfbdb3ef77e22/src/utils/tokens/index.js#L425
async function createAndTransferToAccount({
    connection,
    owner,
    sourcePublicKey,
    destinationPublicKey,
    amount,
    memo,
    mint,
}) {
    const newAccount = new Account();
    let transaction = new Transaction();
    transaction.add(
        assertOwner({
            account: destinationPublicKey,
            owner: SystemProgram.programId,
        }),
    );
    transaction.add(
        SystemProgram.createAccount({
            fromPubkey: owner.publicKey,
            newAccountPubkey: newAccount.publicKey,
            lamports: await connection.getMinimumBalanceForRentExemption(
                ACCOUNT_LAYOUT.span,
            ),
            space: ACCOUNT_LAYOUT.span,
            programId: TOKEN_PROGRAM_ID,
        }),
    );
    transaction.add(
        initializeAccount({
            account: newAccount.publicKey,
            mint,
            owner: destinationPublicKey,
        }),
    );
    const transferBetweenAccountsTxn = createTransferBetweenSplTokenAccountsInstruction(
        {
          ownerPublicKey: owner.publicKey,
          sourcePublicKey,
          destinationPublicKey: newAccount.publicKey,
          amount,
          memo,
        },
    );
    transaction.add(transferBetweenAccountsTxn);
    let signers = [newAccount];
    return await signAndSendTransaction(connection, transaction, owner, signers);
};

module.exports = {
    createAndTransferToAccount,
};
