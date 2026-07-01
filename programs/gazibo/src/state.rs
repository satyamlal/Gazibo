use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct Job {
    pub client: Pubkey,
    pub freelancer: Option<Pubkey>,
    pub amount: u64,
    pub status: JobStatus,

    #[max_len(50)]
    pub title: String,

    #[max_len(500)]
    pub description: String,

    pub job_id: u64,
    pub create_at: i64,
    pub bump: u8,
}

impl Job {
    pub fn space(title_len: usize, desc_len: usize) -> usize {
        8 + // Anchor discriminator (always first, always 8 bytes)
        32 + // client: Pubkey
        33 + // freelancer: Option<Pubkey>
        8 + // amount
        1 + // 
        8 + // job_id: u64
        (4 + title_len) + // title: String -> 4 bytes 
        (4 + desc_len) + // description: String -> 4 bytes
        8 + // created_at: u64
        1 //bump
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum JobStatus {
    Open,
    InProgress,
    Delivered,
    Completed,
    Cancelled,
}

impl Default for JobStatus {
    fn default() -> Self {
        JobStatus::Open
    }
}
