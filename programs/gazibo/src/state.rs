use anchor_lang::prelude::*;

#[derive(InitSpace)]
#[account]
pub struct JobAccount {
    pub client: Pubkey,             // 32 - job creator
    pub freelancer: Option<Pubkey>, // 33 - None until accepted (1 tag + 32)
    pub amount: u64,                // 8 - lamports locked in escrow
    pub status: JobStatus,          // 1 - current state

    #[max_len(50)]
    pub title: String, // 4 + N bytes (borsh: 4 byte len prefix + content)

    #[max_len(500)]
    pub description: String, // 4 + N bytes

    pub job_id: u64,     // 8 - from clientProfile counter (unique per profile)
    pub created_at: i64, // 8 - unix timestamp
    pub bump: u8,        // 1 - stored cannonical PDA bump
}

impl JobAccount {
    pub fn space(title_len: usize, desc_len: usize) -> usize {
        8 + // Anchor discriminator (always first, always 8 bytes)
        32 + // client: Pubkey
        33 + // freelancer: Option<Pubkey>
        8 + // amount
        1 + // status
        8 + // job_id: u64
        (4 + title_len) + // title: String -> 4 bytes 
        (4 + desc_len) + // description: String -> 4 bytes
        8 + // created_at: u64
        1 //bump
    }
}

#[account]
#[derive(Debug)]
pub struct ClientProfile {
    pub client: Pubkey,   // 32 - owner wallet
    pub job_counter: u64, // 8 - next job_id to use (0-indexed)
    pub total_spent: u64, // 8 - lifetime lamports locked (stats)
    pub active_jobs: u32, // 4 - currently open/in-progress jobs (stats)
    pub bump: u8,         // 1 - cannonical bump
}

impl ClientProfile {
    pub const SPACE: usize = 8 + // discriminator 
                                32 + // client
                                8 + // job_counter
                                8 + // total_spent
                                4 + //active jobs
                                1; // bump
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
