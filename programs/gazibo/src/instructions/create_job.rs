use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::constants::*;
use crate::error::GaziboError;
use crate::state::{JobAccount, JobStatus};
use crate::ClientProfile;

#[derive(Accounts)]
#[instruction(title: String, description: String, job_id: u64)]
pub struct CreateJob<'info> {
    #[account(
        mut,
        seeds = [CLIENT_PROFILE_SEED, client.key().as_ref()],
        bump = client_profile.bump,
        has_one = client @ GaziboError::NotJobClient,
    )]
    pub client_profile: Account<'info, ClientProfile>,

    #[account(
        init,
        payer = client,
        space = 8 + JobAccount::INIT_SPACE,
        seeds = [
            JOB_SEED,
            client.key().as_ref(),
            &job_id.to_le_bytes()
        ],
        bump
    )]
    pub job_account: Account<'info, JobAccount>,

    #[account(mut)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn create_job_handler(
    ctx: Context<CreateJob>,
    title: String,
    description: String,
    amount: u64,
    job_id: u64,
) -> Result<()> {
    require!(amount > MIN_AMOUNT_LAMPORTS, GaziboError::AmountTooLow);
    require!(!title.is_empty(), GaziboError::TitleEmpty);
    require!(title.len() <= MAX_TITLE_LENGTH, GaziboError::TitleTooLong);
    require!(
        description.len() <= MAX_DESC_LENGTH,
        GaziboError::DescriptionTooLong
    );

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.client.to_account_info(),
                to: ctx.accounts.job_account.to_account_info(),
            },
        ),
        amount,
    )?;

    {
        let job = &mut ctx.accounts.job_account;
        let clock = Clock::get()?;

        job.client = ctx.accounts.client.key();
        job.freelancer = None;
        job.amount = amount;
        job.status = JobStatus::Open;
        job.title = title;
        job.description = description;
        job.job_id = job_id;
        job.created_at = clock.unix_timestamp;
        job.bump = ctx.bumps.job_account;
    }

    {
        let client_profile = &mut ctx.accounts.client_profile;

        client_profile.job_counter = job_id
            .checked_add(1)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;

        client_profile.total_spent = client_profile
            .total_spent
            .checked_add(amount)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;

        client_profile.active_jobs = client_profile
            .active_jobs
            .checked_add(1)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    }

    emit!(JobCreated {
        job_id,
        client: ctx.accounts.client.key(),
        amount
    });

    Ok(())
}

#[event]
pub struct JobCreated {
    pub job_id: u64,
    pub client: Pubkey,
    pub amount: u64,
}
