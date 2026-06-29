use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

pub use constants::*;
use instructions::{AcceptJob, CreateJob, DeliverJob, ReleasePayment};
pub use state::*;

declare_id!("5bTvxVfSwqy7FApuPfHiXBWihZSmLSQNsGwVebNeLj7D");

#[program]
pub mod gazibo {
    use super::*;

    pub fn create_job(
        ctx: Context<CreateJob>,
        title: String,
        amount: u64,
        job_id: u64,
    ) -> Result<()> {
        instructions::create_job::handler(ctx, title, amount, job_id)
    }

    pub fn accept_job(ctx: Context<AcceptJob>) -> Result<()> {
        instructions::accept_job::handler(ctx)
    }

    pub fn deliver_job(ctx: Context<DeliverJob>) -> Result<()> {
        instructions::deliver_job::handler(ctx)
    }

    pub fn release_payment(ctx: Context<ReleasePayment>) -> Result<()> {
        instructions::release_payment::handler(ctx)
    }
}
