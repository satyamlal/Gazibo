use crate::constants::*;
use crate::error::GaziboError;
use crate::state::{Job, JobStatus};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeliverJob<'info> {
    pub freelancer: Signer<'info>,

    #[account(
        mut,
        seeds = [
            JOB_SEED,
            job.client.as_ref(),
            &job.job_id.to_le_bytes(),
        ],
        bump = job.bump,
    )]
    pub job: Account<'info, Job>,
}

pub fn deliver_job_handler(ctx: Context<DeliverJob>) -> Result<()> {
    let job = &mut ctx.accounts.job;
    let freelancer = ctx.accounts.freelancer.key();

    require!(
        job.status == JobStatus::InProgress,
        GaziboError::JobNotInProgress,
    );
    require!(job.freelancer.is_some(), GaziboError::NoFreelancerAssigned);
    require!(
        job.freelancer == Some(freelancer),
        GaziboError::UnauthorizedFreelancer
    );

    job.status = JobStatus::Delivered;

    Ok(())
}

// use crate::constants::*;
// use crate::error::GaziboError;
// use crate::state::{Job, JobStatus};
// use anchor_lang::prelude::*;

// #[derive(Accounts)]
// pub struct DeliverJob<'info> {
//     pub freelancer: Signer<'info>,

//     #[account(
//         mut,
//         seeds = [
//             JOB_SEED,
//             job.client.as_ref(),
//             &job.job_id.to_le_bytes()
//         ],
//         bump = job.bump
//     )]
//     pub job: Account<'info, Job>,
// }

// pub fn deliver_job_handler(ctx: Context<DeliverJob>) -> Result<()> {
//     let job = &mut ctx.accounts.job;
//     let freelancer = ctx.accounts.freelancer.key();

//     require!(
//         job.status == JobStatus::InProgress,
//         GaziboError::JobNotInProgress
//     );
//     require!(job.freelancer.is_some(), GaziboError::NoFreelancerAssigned);
//     require!(
//         job.freelancer == Some(freelancer),
//         GaziboError::UnauthorizedFreelancer
//     );

//     job.status = JobStatus::Delivered;

//     Ok(())
// }
