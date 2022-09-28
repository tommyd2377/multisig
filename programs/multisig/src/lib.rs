use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod multisig {
    use super::*;

    pub fn create_multisig(ctx: Context<CreateMultisig>, sigs: Vec<Pubkey>, threshold: i32) -> Result<()> {
        let multisig = &mut ctx.accounts.multisig;
        multisig.sigs = sigs;
        multisig.threshold = threshold;
        Ok(())
    }

    pub fn create_transaction(ctx: Context<CreateTransaction>, multisig: Pubkey, requested_by: Pubkey) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        // let multisig = &ctx.accounts.multisig;
        // let requested_by = &ctx.accounts.requested_by;
        transaction.multisig = multisig;
        transaction.requested_by = requested_by;
        transaction.did_run = false;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMultisig<'info> {
    #[account(init, payer = payer, space = 500)]
    pub multisig: Account<'info, Multisig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(init, payer = payer, space = 500)]
    pub transaction: Account<'info, Transaction>,
    // pub multisig: Account<'info, Multisig>,
    // pub requested_by: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Multisig {
    pub sigs: Vec<Pubkey>,
    pub threshold: i32,
}

#[account]
pub struct Transaction {
    pub multisig: Pubkey,
    pub requested_by: Pubkey,
    pub did_run: bool,
}
