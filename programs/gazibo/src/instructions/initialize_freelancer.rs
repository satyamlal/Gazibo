use anchor_lang::prelude::*;

use crate::constants::{FREELANCER_PROFILE_SEED, ROLE_SEED};
use crate::state::{FreelancerProfile, RoleRegistry, UserRole};

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

    #[account(
        init,
        payer = freelancer,
        space = RoleRegistry::SPACE,
        seeds = [ROLE_SEED, freelancer.key().as_ref()],
        bump,
    )]
    pub role_registry: Account<'info, RoleRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_freelancer_handler(ctx: Context<InitializeFreelancer>) -> Result<()> {
    let registry = &mut ctx.accounts.role_registry;
    registry.wallet = ctx.accounts.freelancer.key();
    registry.role = UserRole::Freelancer;
    registry.bump = ctx.bumps.role_registry;

    let profile = &mut ctx.accounts.freelancer_profile;
    profile.freelancer = ctx.accounts.freelancer.key();
    profile.gig_counter = 0;
    profile.jobs_completed = 0;
    profile.total_earned = 0;
    profile.rating_sum = 0;
    profile.rating_count = 0;
    profile.bump = ctx.bumps.freelancer_profile;

    emit!(FreelancerInitialized {
        freelancer: ctx.accounts.freelancer.key(),
    });

    Ok(())
}

#[event]
pub struct FreelancerInitialized {
    pub freelancer: Pubkey,
}
