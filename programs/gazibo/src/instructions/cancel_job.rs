use anchor_lang::prelude::*;

use crate::constants::JOB_SEED;
use crate::error::GaziboError;
use crate::state::{JobAccount, JobStatus};

#[derive(Accounts)]
pub struct CancelJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        mut,
        close = client,
        has_one = client @ GaziboError::NotJobClient,
        seeds = [
            JOB_SEED,
            job_account.client.as_ref(),
            &job_account.job_id.to_le_bytes(),
        ],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

pub fn cancel_job_handler(ctx: Context<CancelJob>) -> Result<()> {
    let job = &ctx.accounts.job_account;

    require!(
        job.status == JobStatus::Open,
        GaziboError::JobNotCancellable
    );

    emit!(JobCancelled {
        job_id: job.job_id,
        client: job.client,
        refund_amount: job.amount,
    });

    Ok(())
}

#[event]
pub struct JobCancelled {
    pub job_id: u64,
    pub client: Pubkey,
    pub refund_amount: u64,
}
