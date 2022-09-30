use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod multisig {
    use super::*;

    pub fn create_multisig(ctx: Context<CreateMultisig>, sigs: Vec<Pubkey>, threshold: i32, nonce: u8) -> Result<()> {
        sigs_are_unique(&sigs)?;
        let multisig: &mut Account<Multisig> = &mut ctx.accounts.multisig;

        multisig.sigs = sigs;
        multisig.threshold = threshold;
        multisig.nonce = nonce;
        Ok(())
    }

    pub fn create_transaction(ctx: Context<CreateTransaction>, multisig: Pubkey, requested_by: Pubkey, 
        program: Pubkey, accs: Pubkey, data: u8) -> Result<()> {
        let transaction: &mut Account<Transaction> = &mut ctx.accounts.transaction;
        let multisig1: &mut Account<Multisig> = &mut ctx.accounts.multisig;

        let keys = &multisig1.sigs;
        
        if !keys.contains(&requested_by) {
            return Err(ErrorCode::InvalidSig.into())
        }

        transaction.multisig = multisig;
        transaction.requested_by = requested_by;
        transaction.did_run = false;
        transaction.data = data;
        transaction.program = program;
        transaction.accs = accs;

        Ok(())
    }

    pub fn approve_transaction(ctx: Context<ApproveTransaction>, the_key: Pubkey) -> Result<()> {
        let multisig: &mut Account<Multisig> = &mut ctx.accounts.multisig;
        let keys = &multisig.sigs;

        if ctx.accounts.transaction.did_run {
            return Err(ErrorCode::TransactionComplete.into())
        }

        let transaction: &mut Account<Transaction> = &mut ctx.accounts.transaction;
        let key_vec = &mut transaction.approved;

        if !keys.contains(&the_key) {
            return Err(ErrorCode::InvalidSig.into())
        }

        key_vec.push(the_key);

        if multisig.threshold == key_vec.len() as i32 {
            //run transactions here
            transaction.did_run = true;
        }
    
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateMultisig<'info> {
    #[account(init, payer = payer, space = 200)]
    pub multisig: Account<'info, Multisig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(init, payer = payer, space = 300)]
    pub transaction: Account<'info, Transaction>,
    pub multisig: Account<'info, Multisig>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveTransaction<'info> {
    #[account(mut)]
    pub transaction: Account<'info, Transaction>,
    pub multisig: Account<'info, Multisig>,
    pub signature: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Multisig {
    pub sigs: Vec<Pubkey>,
    pub threshold: i32,
    pub nonce: u8,
}

#[account]
pub struct Transaction {
    pub multisig: Pubkey,
    pub requested_by: Pubkey,
    pub approved: Vec<Pubkey>,
    pub program: Pubkey,
    pub accs: Pubkey,
    pub data: u8,
    pub did_run: bool,
}

fn sigs_are_unique(sigs: &[Pubkey]) -> Result<()> {
    for (i, sig) in sigs.iter().enumerate() {
        require!(
            !sigs.iter().skip(i + 1).any(|item| item == sig),
            UniqueSigs
        )
    }
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Transaction has already been approved and run")]
    TransactionComplete,
    #[msg("Unique signatures required")]
    UniqueSigs,
    #[msg("You do not have access to multisig wallet")]
    InvalidSig,
}