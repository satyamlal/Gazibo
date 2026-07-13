use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::GaziboError;
use crate::state::{JobAccount, JobStatus};

#[derive(Accounts)]
pub struct DeliverJob<'info> {
    pub freelancer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            JOB_SEED,
            job_account.client.as_ref(),
            &job_account.job_id.to_le_bytes(),
        ],
        bump = job_account.bump,
    )]
    pub job_account: Account<'info, JobAccount>,
}

pub fn deliver_job_handler(ctx: Context<DeliverJob>) -> Result<()> {
    let job_account = &mut ctx.accounts.job_account;
    let freelancer_key = ctx.accounts.freelancer.key();

    require!(
        job_account.status == JobStatus::InProgress,
        GaziboError::JobNotInProgress
    );

    require!(
        freelancer_key != job_account.client,
        GaziboError::ClientCannotBeFreelancer
    );

    let assigned = job_account
        .freelancer
        .ok_or(error!(GaziboError::NoFreelancerAssigned))?;

    require!(
        freelancer_key == assigned,
        GaziboError::UnauthorizedFreelancer
    );

    job_account.status = JobStatus::Delivered;

    emit!(JobDelivered {
        job_id: job_account.job_id,
        freelancer: freelancer_key,
    });

    Ok(())
}

#[event]
pub struct JobDelivered {
    pub job_id: u64,
    pub freelancer: Pubkey,
}
