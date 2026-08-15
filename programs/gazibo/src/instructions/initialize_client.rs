use anchor_lang::prelude::*;

use crate::constants::{CLIENT_PROFILE_SEED, ROLE_SEED};
use crate::state::{ClientProfile, RoleRegistry, UserRole};

#[derive(Accounts)]
pub struct InitializeClient<'info> {
    #[account(mut)]
    pub client: Signer<'info>,

    #[account(
        init,
        payer = client,
        space = ClientProfile::SPACE,
        seeds = [CLIENT_PROFILE_SEED, client.key().as_ref()],
        bump,
    )]
    pub client_profile: Account<'info, ClientProfile>,

    #[account(
        init,
        payer = client,
        space = RoleRegistry::SPACE,
        seeds = [ROLE_SEED, client.key().as_ref()],
        bump,
    )]
    pub role_registry: Account<'info, RoleRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_client_handler(ctx: Context<InitializeClient>) -> Result<()> {
    let registry = &mut ctx.accounts.role_registry;
    registry.wallet = ctx.accounts.client.key();
    registry.role = UserRole::Client;
    registry.bump = ctx.bumps.role_registry;

    let profile = &mut ctx.accounts.client_profile;
    profile.client = ctx.accounts.client.key();
    profile.job_counter = 0;
    profile.total_spent = 0;
    profile.active_jobs = 0;
    profile.bump = ctx.bumps.client_profile;

    emit!(ClientInitialized {
        client: ctx.accounts.client.key(),
    });

    Ok(())
}

#[event]
pub struct ClientInitialized {
    pub client: Pubkey,
}
