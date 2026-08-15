use anchor_lang::prelude::*;

use crate::constants::{CLIENT_PROFILE_SEED, JOB_SEED};
use crate::error::GaziboError;
use crate::state::{ClientProfile, JobAccount, JobStatus};

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

    #[account(
        mut,
        seeds = [CLIENT_PROFILE_SEED, client.key().as_ref()],
        bump = client_profile.bump,
    )]
    pub client_profile: Account<'info, ClientProfile>,
}

pub fn cancel_job_handler(ctx: Context<CancelJob>) -> Result<()> {
    let job = &ctx.accounts.job_account;

    require!(
        job.status == JobStatus::Open,
        GaziboError::JobNotCancellable,
    );

    let cp = &mut ctx.accounts.client_profile;
    cp.active_jobs = cp.active_jobs.saturating_sub(1);

    emit!(JobCancelled {
        job_id: job.job_id,
        client: job.client,
        refund_amount: job.amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct JobCancelled {
    pub job_id: u64,
    pub client: Pubkey,
    pub refund_amount: u64,
    pub timestamp: i64,
}
