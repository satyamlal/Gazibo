use anchor_lang::prelude::*;

use crate::constants::JOB_SEED;
use crate::error::GaziboError;
use crate::state::*;

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(
        mut,
        close = client,
        has_one = client @ GaziboError::NotJobClient,
        seeds = [JOB_SEED, job_account.client.as_ref(), &job_account.job_id.to_le_bytes()],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,

    #[account(mut)]
    pub client: Signer<'info>,

    #[account(mut)]
    pub freelancer: UncheckedAccount<'info>,
}

pub fn release_payment_handler(ctx: Context<ReleasePayment>) -> Result<()> {
    require!(
        ctx.accounts.job_account.status == JobStatus::Delivered,
        GaziboError::JobNotDelivered,
    );

    let stored_freelancer = ctx
        .accounts
        .job_account
        .freelancer
        .ok_or(error!(GaziboError::JobNotInProgress))?;

    require!(
        ctx.accounts.freelancer.key() == stored_freelancer,
        GaziboError::NotAssignedFreelancer,
    );

    let amount = ctx.accounts.job_account.amount;
    let job_id = ctx.accounts.job_account.job_id;
    let client_key = ctx.accounts.job_account.client;
    let job_account_info = ctx.accounts.job_account.to_account_info();
    let freelance_info = ctx.accounts.freelancer.to_account_info();

    {
        let mut job_lamports = job_account_info.try_borrow_mut_lamports()?;

        **job_lamports = (**job_lamports)
            .checked_sub(amount)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    }

    // credit freelancer
    {
        let mut freelancer_lamports = freelance_info.try_borrow_mut_lamports()?;

        **freelancer_lamports = (**freelancer_lamports)
            .checked_add(amount)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    }

    emit!(PaymentReleased {
        job_id,
        client: client_key,
        freelancer: stored_freelancer,
        amount,
    });

    Ok(())
}

#[event]
pub struct PaymentReleased {
    pub job_id: u64,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
}
