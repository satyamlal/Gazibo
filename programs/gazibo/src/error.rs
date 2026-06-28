use anchor_lang::prelude::*;

#[error_code]
pub enum GaziboError {
    #[msg("Amount must be greater than zero!")]
    InvalidAmount,

    #[msg("Title can't be empty!")]
    TitleEmpty,

    #[msg("Title is too long, max 50 characters allowed!")]
    TitleTooLong,

    #[msg("Job is not open for applications!")]
    JobNotOpen,

    #[msg("Job is not currently in progress!")]
    JobNotInProgress,

    #[msg("Job has not been marked as Delivered yet!")]
    JobNotDelivered,

    #[msg("Only the assigned freelancer can do this action!")]
    UnauthorizedFreelancer,

    #[msg("Only the client who creatd this job can perform this action!")]
    UnauthorizedClient,

    #[msg("No freelancer assigned to this job!")]
    NoFreelancerAssigned,

    #[msg("The client can't be the freelancer on their own job!")]
    ClientCannotBeFreelancer,

    #[msg("Escrow accounts has insufficient lamports!")]
    InsufficientEscrowFunds,
}
