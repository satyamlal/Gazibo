use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct AcceptJob<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
}

pub fn accept_job_handler(_ctx: Context<AcceptJob>) -> Result<()> {
    Ok(())
}
