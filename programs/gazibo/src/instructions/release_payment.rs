use crate::constants::*;
use crate::error::GaziboError;
use crate::state::{Job, JobStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    pub client: Signer<'info>,

    #[account(mut)]
    pub freelancer: UncheckedAccount<'info>,

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

pub fn release_payment_handler(ctx: Context<ReleasePayment>) -> Result<()> {
    let job = &mut ctx.accounts.job;
    let client = ctx.accounts.client.key();
    let freelancer = ctx.accounts.freelancer.key();

    require!(job.client == client, GaziboError::UnauthorizedClient);
    require!(
        job.status == JobStatus::Delivered,
        GaziboError::JobNotDelivered
    );
    require!(job.freelancer.is_some(), GaziboError::NoFreelancerAssigned);
    require!(
        job.freelancer == Some(freelancer),
        GaziboError::UnauthorizedFreelancer
    );
    require!(
        job.to_account_info().lamports() >= job.amount,
        GaziboError::InsufficientEscrowFunds
    );

    **job.to_account_info().try_borrow_mut_lamports()? -= job.amount;

    **ctx
        .accounts
        .freelancer
        .to_account_info()
        .try_borrow_mut_lamports()? += job.amount;

    job.status = JobStatus::Completed;

    Ok(())
}
