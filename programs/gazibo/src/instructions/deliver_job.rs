// use crate::constants::*;
// use crate::error::GaziboError;
// use crate::state::{Job, JobStatus};
use anchor_lang::prelude::*;
// use anchor_lang::system_program;

#[derive(Accounts)]
pub struct DeliverJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
}

pub fn handler(ctx: Context<DeliverJob>) -> Result<()> {
    Ok(())
}
