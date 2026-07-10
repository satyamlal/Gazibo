use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5bTvxVfSwqy7FApuPfHiXBWihZSmLSQNsGwVebNeLj7D");

#[program]
pub mod gazibo {
    use super::*;

    pub fn initialize_client(ctx: Context<InitializeClient>) -> Result<()> {
        initialize_client_handler(ctx)
    }

    pub fn create_job(
        ctx: Context<CreateJob>,
        job_id: u64,
        title: String,
        description: String,
        amount: u64,
    ) -> Result<()> {
        instructions::create_job::create_job_handler(ctx, job_id, title, description, amount)
    }

    pub fn accept_job(ctx: Context<AcceptJob>) -> Result<()> {
        instructions::accept_job::accept_job_handler(ctx)
    }

    pub fn deliver_job(ctx: Context<DeliverJob>) -> Result<()> {
        instructions::deliver_job::deliver_job_handler(ctx)
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        instructions::release_payment::release_payment_handler(ctx)
    }
}
