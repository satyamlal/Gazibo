use anchor_lang::prelude::*;

use crate::constants::{
    FREELANCER_PROFILE_SEED, GIG_SEED, MAX_GIG_TITLE_LENGTH, MAX_METADATA_URI_LEN,
    MIN_AMOUNT_LAMPORTS,
};
use crate::error::GaziboError;
use crate::state::{FreelancerProfile, GigAccount};

#[derive(Accounts)]
#[instruction(gig_id: u64, title: String, basic_price: u64, standard_price: u64, premium_price: u64, metadata_uri: String)]
pub struct CreateGig<'info> {
    #[account(mut)]
    pub freelancer: Signer<'info>,

    #[account(
        mut,
        seeds = [FREELANCER_PROFILE_SEED, freelancer.key().as_ref()],
        bump = freelancer_profile.bump,
        has_one = freelancer @ GaziboError::FreelancerNotInitialized,
    )]
    pub freelancer_profile: Account<'info, FreelancerProfile>,

    #[account(
        init,
        payer = freelancer,
        space = GigAccount::space(title.len(), metadata_uri.len()),
        seeds = [GIG_SEED, freelancer.key().as_ref(), &gig_id.to_le_bytes()],
        bump,
    )]
    pub gig_account: Account<'info, GigAccount>,

    pub system_program: Program<'info, System>,
}

pub fn create_gig_handler(
    ctx: Context<CreateGig>,
    gig_id: u64,
    title: String,
    basic_price: u64,
    standard_price: u64,
    premium_price: u64,
    metadata_uri: String,
) -> Result<()> {
    require!(!title.is_empty(), GaziboError::GigTitleEmpty);
    require!(
        title.len() <= MAX_GIG_TITLE_LENGTH,
        GaziboError::GigTitleTooLong
    );
    require!(
        metadata_uri.len() <= MAX_METADATA_URI_LEN,
        GaziboError::MetadataUriTooLong
    );
    require!(
        basic_price >= MIN_AMOUNT_LAMPORTS,
        GaziboError::AmountTooLow
    );
    require!(
        standard_price >= basic_price && premium_price >= standard_price,
        GaziboError::InvalidPricing
    );

    let gig = &mut ctx.accounts.gig_account;
    let freelancer_key = ctx.accounts.freelancer.key();

    gig.freelancer = freelancer_key;
    gig.gig_id = gig_id;
    gig.title = title.clone();
    gig.basic_price = basic_price;
    gig.standard_price = standard_price;
    gig.premium_price = premium_price;
    gig.is_active = true;
    gig.created_at = Clock::get()?.unix_timestamp;
    gig.metadata_uri = metadata_uri;
    gig.bump = ctx.bumps.gig_account;

    let profile = &mut ctx.accounts.freelancer_profile;
    profile.gig_counter = profile
        .gig_counter
        .checked_add(1)
        .ok_or(GaziboError::ArithmeticOverflow)?;

    emit!(GigCreated {
        freelancer: freelancer_key,
        gig_id,
        title
    });

    Ok(())
}

#[event]
pub struct GigCreated {
    pub freelancer: Pubkey,
    pub gig_id: u64,
    pub title: String,
}
