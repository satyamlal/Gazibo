use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReleasePayment<'info> {
    #[account(mut)]
    pub client: Signer<'info>,
}

pub fn release_payment_handler(_ctx: Context<ReleasePayment>) -> Result<()> {
    Ok(())
}
