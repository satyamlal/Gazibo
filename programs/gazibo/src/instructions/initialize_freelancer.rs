use anchor_lang::prelude::*;

use crate::constants::FREELANCER_PROFILE_SEED;
use crate::state::FreelancerProfile;

#[derive(Accounts)]
pub struct InitializeFreelancer<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,

    #[account(
        init,
        payer = freelancer,
        space = FreelancerProfile::SPACE,
        seeds = [FREELANCER_PROFILE_SEED, freelancer.key().as_ref()],
        bump,
    )]
    pub freelancer_profile: Account<'info, FreelancerProfile>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_freelancer_handler(ctx: Context<InitializeFreelancer>) -> Result<()> {
    let profile = &mut ctx.accounts.freelancer_profile;
    let freelancer_key = ctx.accounts.freelancer.key();

    profile.freelancer = freelancer_key;
    profile.gig_counter = 0;
    profile.jobs_completed = 0;
    profile.total_earned = 0;
    profile.rating_sum = 0;
    profile.rating_count = 0;
    profile.bump = ctx.bumps.freelancer_profile;

    emit!(FreelancerInitialized {
        freelancer: freelancer_key,
    });

    Ok(())
}

#[event]
pub struct FreelancerInitialized {
    pub freelancer: Pubkey,
}
