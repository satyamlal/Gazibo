use crate::constants::*;
use crate::error::GaziboError;
use crate::state::{Job, JobStatus};
use anchor_lang::prelude::*;
use anchor_lang::system_program;

#[derive(Accounts)]
#[instruction(title: String, amount: u64, job_id: u64)]
pub struct CreateJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        init,
        payer = client,
        space = 8 + Job::INIT_SPACE,
        seeds = [
            JOB_SEED,
            client.key().as_ref(),
            &job_id.to_le_bytes()
        ],
        bump
    )]
    pub job: Account<'info, Job>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateJob>, title: String, amount: u64, job_id: u64) -> Result<()> {
    require!(amount > 0, GaziboError::InvalidAmount);
    require!(!title.is_empty(), GaziboError::TitleEmpty);
    require!(title.len() <= MAX_TITLE_LENGTH, GaziboError::TitleTooLong);

    let job = &mut ctx.accounts.job;
    job.client = ctx.accounts.client.key();
    job.freelancer = None;
    job.amount = amount;
    job.status = JobStatus::Open;
    job.title = title;
    job.bump = ctx.bumps.job;
    job.job_id = job_id;

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.job.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}
