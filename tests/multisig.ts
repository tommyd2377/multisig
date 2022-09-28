import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Multisig } from "../target/types/multisig";

describe("multisig", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Multisig as Program<Multisig>;

  it("Create Multisig Account", async () => {
    // Add your test here.
    let multisig = anchor.web3.Keypair.generate();
    const tx = await program.rpc.createMultisig([], new anchor.BN(3), {
        accounts: {
            multisig: multisig.publicKey,
            payer: program.provider.wallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [multisig],
    });
    console.log("Your transaction signature: ", tx);
  });
});
