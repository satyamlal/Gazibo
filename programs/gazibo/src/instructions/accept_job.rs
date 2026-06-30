use crate::constants::*;
use crate::error::GaziboError;
use crate::state::{Job, JobStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AcceptJob<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            JOB_SEED,
            job.client.as_ref(),
            &job.job_id.to_le_bytes(),
        ],
        bump = job.bump
    )]
    pub job: Account<'info, Job>,
}

pub fn accept_job_handler(ctx: Context<AcceptJob>) -> Result<()> {
    let job = &mut ctx.accounts.job;
    let freelancer = ctx.accounts.freelancer.key();

    require!(job.status == JobStatus::Open, GaziboError::JobNotOpen);
    require!(
        job.client != freelancer,
        GaziboError::ClientCannotBeFreelancer,
    );

    job.freelancer = Some(freelancer);
    job.status = JobStatus::InProgress;

    Ok(())
}
