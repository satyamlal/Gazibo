use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DeliverJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
}

pub fn deliver_job_handler(_ctx: Context<DeliverJob>) -> Result<()> {
    Ok(())
}
