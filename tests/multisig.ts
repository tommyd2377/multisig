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
    const fakeSig = anchor.web3.Keypair.generate();
    const sigs = [sig.publicKey, sig1.publicKey, sig2.publicKey];

  it("Create Multisig Account", async () => {
    // Add your test here.
    multisig = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(sig.publicKey, 10000000000);
    await program.provider.connection.confirmTransaction(signature);
    const tx = await program.rpc.createMultisig(sigs, new anchor.BN(3), {
        accounts: {
            multisig: multisig.publicKey,
            payer: sig.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [multisig, sig],
    });
    multisigAccount = await program.account.multisig.fetch(multisig.publicKey);
    multiKey = multisig.publicKey;
    console.log("Threshold: " + multisigAccount.threshold);
    console.log("Signatures: " + multisigAccount.sigs);
    console.log("Your transaction signature: " + tx);
  });

  it("Create Transaction Account", async () => {
    // Add your test here.
    transaction = anchor.web3.Keypair.generate();
    let programid = anchor.web3.Keypair.generate();
    let accountids = anchor.web3.Keypair.generate();
    let data = "data";
    const tx = await program.rpc.createTransaction(multisig.publicKey, sig.publicKey, programid.publicKey, accountids.publicKey, data, {
        accounts: {
            transaction: transaction.publicKey,
            multisig: multisig.publicKey,
            payer: sig.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [transaction, sig],
    });
    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log("Did Run: " + transactionAccount.didRun);
    console.log("Multisig: " + transactionAccount.multisig.toString());
    console.log("Requested By: " + transactionAccount.requestedBy.toString());
  });

  it("Approve Transaction One", async () => {
    // Add your test here.
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
    console.log("Did Run: " + transactionAccount.didRun);
    console.log("Multisig: " + transactionAccount.multisig.toString());
    console.log("Requested By: " + transactionAccount.requestedBy.toString());
    console.log("Approved By: " + transactionAccount.approved);
  });

  it("Approve Transaction Two", async () => {
    // Add your test here.
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
    console.log("Did Run: " + transactionAccount.didRun);
    console.log("Multisig: " + transactionAccount.multisig.toString());
    console.log("Requested By: " + transactionAccount.requestedBy.toString());
    console.log("Approved By: " + transactionAccount.approved);
  });

  it("Test should fail. Invalid Signature", async () => {
    // Add your test here.
    const tx = await program.rpc.approveTransaction(fakeSig.publicKey, {
        accounts: {
            transaction: transaction.publicKey,
            multisig: multisig.publicKey,
            signature: fakeSig.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [fakeSig],
    });
    let transactionAccount = await program.account.transaction.fetch(transaction.publicKey);
    console.log("Did Run: " + transactionAccount.didRun);
    console.log("Multisig: " + transactionAccount.multisig.toString());
    console.log("Requested By: " + transactionAccount.requestedBy.toString());
    console.log("Approved By: " + transactionAccount.approved);
  });

  it("Approve Transaction Three", async () => {
    // Add your test here.
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
    console.log("Did Run: " + transactionAccount.didRun);
    console.log("Multisig: " + transactionAccount.multisig.toString());
    console.log("Requested By: " + transactionAccount.requestedBy.toString());
    console.log("Approved By: " + transactionAccount.approved);
  });
});
