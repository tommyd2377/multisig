import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Multisig } from "../target/types/multisig";

describe("multisig", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Multisig as Program<Multisig>;
  let multisigAccount;
  let multiKey;
  let multisig;
  let transaction;

    const sig = anchor.web3.Keypair.generate();
    const sig1 = anchor.web3.Keypair.generate();
    const sig2 = anchor.web3.Keypair.generate();
    const sigs = [sig.publicKey, sig1.publicKey, sig2.publicKey];

  it("Create Multisig Account", async () => {
    // Add your test here.
    multisig = anchor.web3.Keypair.generate();
    const tx = await program.rpc.createMultisig(sigs, new anchor.BN(2), {
        accounts: {
            multisig: multisig.publicKey,
            payer: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [multisig],
    });
    multisigAccount = await program.account.multisig.fetch(multisig.publicKey);
    multiKey = multisig.publicKey;
    console.log(multisigAccount.threshold);
    console.log(multisigAccount.sigs);
    console.log("Your transaction signature: ", tx);
  });

  it("Create Transaction Account", async () => {
    // Add your test here.
    transaction = anchor.web3.Keypair.generate();
    console.log(sig.publicKey)
    const tx = await program.rpc.createTransaction(multiKey, sig.publicKey, {
        accounts: {
            transaction: transaction.publicKey,
            // multisig: multiKey,
            // requestedBy: sig.publicKey,
            payer: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [transaction],
    });
    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log(transactionAccount.didRun);
    console.log(transactionAccount.multisig.toString());
    console.log(transactionAccount.requestedBy.toString());
  });

  it("Approve Transaction One", async () => {
    // Add your test here.
    console.log(sig.publicKey)
    const tx = await program.rpc.approveTransaction(sig.publicKey, {
        accounts: {
            transaction: transaction.publicKey,
            multisig: multisig.publicKey,
            signature: sig.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [sig],
    });
    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log(transactionAccount.didRun);
    console.log(transactionAccount.multisig.toString());
    console.log(transactionAccount.requestedBy.toString());
  });

  it("Approve Transaction Two", async () => {
    // Add your test here.
    console.log(sig1.publicKey)
    const tx = await program.rpc.approveTransaction(sig1.publicKey, {
        accounts: {
            transaction: transaction.publicKey,
            multisig: multisig.publicKey,
            signature: sig1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [sig1],
    });
    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log(transactionAccount.didRun);
    console.log(transactionAccount.multisig.toString());
    console.log(transactionAccount.requestedBy.toString());
  });

  it("Approve Transaction Three", async () => {
    // Add your test here.
    console.log(sig2.publicKey)
    const tx = await program.rpc.approveTransaction(sig2.publicKey, {
        accounts: {
            transaction: transaction.publicKey,
            multisig: multisig.publicKey,
            signature: sig2.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [sig2],
    });
    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log(transactionAccount.didRun);
    console.log(transactionAccount.multisig.toString());
    console.log(transactionAccount.requestedBy.toString());
  });
});
