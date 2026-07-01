use anchor_lang::prelude::*;

#[error_code]
pub enum GaziboError {
    #[msg("Job is not open for applications!")]
    JobNotOpen,

    #[msg("Job is not currently in progress!")]
    JobNotInProgress,

    #[msg("Job has not been marked as Delivered yet!")]
    JobNotDelivered,

    #[msg("Job can only be cancelled when Open(not after a freelancer accepts)")]
    JobNotCancellable,

    #[msg("Only the assigned freelancer can do this action!")]
    UnauthorizedFreelancer,

    #[msg("Only the client who creatd this job can perform this action!")]
    UnauthorizedClient,

    #[msg("No freelancer assigned to this job!")]
    NoFreelancerAssigned,

    #[msg("Escrow accounts has insufficient lamports!")]
    InsufficientEscrowFunds,

    // Access Control
    #[msg("Only the job client can perform this action")]
    NotJobClient,

    #[msg("Only the assigned freelancer can perform this action")]
    NotAssignedFreelancer,

    #[msg("The client can't be the freelancer on their own job!")]
    ClientCannotBeFreelancer,

    // Input Validation
    #[msg("Payment must be >== 0.01 SOL (1,000,000 Lamports)")]
    AmountTooLow,

    #[msg("Title can't be empty!")]
    TitleEmpty,

    #[msg("Title is too long, max 50 characters allowed!")]
    TitleTooLong,

    #[msg("Description too long, max 500 characters allowed!")]
    DescriptionTooLong,

    // Arithmetic Safety
    #[msg("Arithmetic overflow in lamport calculation")]
    ArithmeticOverflow,
}
