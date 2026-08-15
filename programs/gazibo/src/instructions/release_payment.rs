use anchor_lang::prelude::*;

use crate::constants::{CLIENT_PROFILE_SEED, FREELANCER_PROFILE_SEED, JOB_SEED, PROTOCOL_FEE_BPS};
use crate::error::GaziboError;
use crate::state::*;

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
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

    #[account(mut)]
    pub client: Signer<'info>,

    #[account(mut)]
    pub freelancer: SystemAccount<'info>,

    // Client profile — decrement active_jobs, increment total_spent.
    #[account(
        mut,
        seeds = [CLIENT_PROFILE_SEED, client.key().as_ref()],
        bump = client_profile.bump,
    )]
    pub client_profile: Account<'info, ClientProfile>,

    // Freelancer profile — increment jobs_completed and total_earned.
    #[account(
        mut,
        seeds = [FREELANCER_PROFILE_SEED, freelancer.key().as_ref()],
        bump = freelancer_profile.bump,
    )]
    pub freelancer_profile: Account<'info, FreelancerProfile>,
}

pub fn release_payment_handler(ctx: Context<ReleasePayment>) -> Result<()> {
    let job = &ctx.accounts.job_account;

    // Status check
    require!(
        job.status == JobStatus::Delivered,
        GaziboError::JobNotDelivered,
    );

    // Verify freelancer key
    let stored = job
        .freelancer
        .ok_or(error!(GaziboError::NoFreelancerAssigned))?;
    require!(
        ctx.accounts.freelancer.key() == stored,
        GaziboError::NotAssignedFreelancer,
    );

    // Fee calculation
    let gross_amount = job.amount;
    let fee_amount = gross_amount
        .checked_mul(PROTOCOL_FEE_BPS)
        .ok_or(error!(GaziboError::ArithmeticOverflow))?
        .checked_div(10_000)
        .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    let net_amount = gross_amount
        .checked_sub(fee_amount)
        .ok_or(error!(GaziboError::ArithmeticOverflow))?;

    //Lamport transfer: escrow → freelancer
    {
        let job_account = ctx.accounts.job_account.to_account_info();
        let mut job_lamports = job_account.try_borrow_mut_lamports()?;

        require!(
            **job_lamports >= net_amount,
            GaziboError::InsufficientEscrowFunds
        );

        **job_lamports = (**job_lamports)
            .checked_sub(net_amount)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    }
    {
        let freelancer_profile = ctx.accounts.freelancer.to_account_info();
        let mut fl_lamports = freelancer_profile.try_borrow_mut_lamports()?;
        **fl_lamports = (**fl_lamports)
            .checked_add(net_amount)
            .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    }

    // Update FreelancerProfile
    let fp = &mut ctx.accounts.freelancer_profile;
    fp.jobs_completed = fp
        .jobs_completed
        .checked_add(1)
        .ok_or(error!(GaziboError::ArithmeticOverflow))?;
    fp.total_earned = fp
        .total_earned
        .checked_add(net_amount)
        .ok_or(error!(GaziboError::ArithmeticOverflow))?;

    // Update ClientProfile
    let cp = &mut ctx.accounts.client_profile;

    cp.active_jobs = cp.active_jobs.saturating_sub(1);
    cp.total_spent = cp
        .total_spent
        .checked_add(gross_amount)
        .ok_or(error!(GaziboError::ArithmeticOverflow))?;

    emit!(PaymentReleased {
        job_id: job.job_id,
        client: ctx.accounts.client.key(),
        freelancer: stored,
        gross_amount,
        fee_amount,
        net_amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct PaymentReleased {
    pub job_id: u64,
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub gross_amount: u64, // full escrow amount before fee
    pub fee_amount: u64,   // protocol fee deducted
    pub net_amount: u64,   // what freelancer actually receives
    pub timestamp: i64,    // unix timestamp for off-chain audit trail
}
