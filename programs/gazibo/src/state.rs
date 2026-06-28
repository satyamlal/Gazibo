use anchor_lang::prelude::*;


#[derive(InitSpace)]
#[account]
pub stuct Job {
    pub client: Pubkey,
    pub freelancer: Option<Pubkey>,
    pub amount: u64,
    pub status: JobStatus,

    #[max_len(50)]
    pub title: String,
    pub bump: u8,
    pub job_id: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum JobStatus {
    Open,
    InProgress,
    Delivered,
    Completed,
}