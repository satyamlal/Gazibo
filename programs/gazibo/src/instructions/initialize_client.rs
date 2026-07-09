use anchor_lang::prelude::*;

use crate::constants::CLIENT_PROFILE_SEED;
use crate::state::ClientProfile;

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

    pub system_program: Program<'info, System>,
}

pub fn initialize_client_handler(ctx: Context<InitializeClient>) -> Result<()> {
    let profile = &mut ctx.accounts.client_profile;
    let client_key = ctx.accounts.client.key();

    profile.client = client_key;
    profile.job_counter = 0;
    profile.total_spent = 0;
    profile.active_jobs = 0;
    profile.bump = ctx.bumps.client_profile;

    emit!(ClientInitialized { client: client_key });

    Ok(())
}

#[event]
pub struct ClientInitialized {
    pub client: Pubkey,
}
