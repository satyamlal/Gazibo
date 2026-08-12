use anchor_lang::prelude::*;

// ─── JobAccount ───────────────────────────────────────────────────────────────
#[derive(InitSpace)]
#[account]
pub struct JobAccount {
    pub client: Pubkey,             // 32 - job creator
    pub freelancer: Option<Pubkey>, // 33 - None until accepted
    pub amount: u64,                // 8  - lamports in escrow
    pub status: JobStatus,          // 1  - current state

    #[max_len(50)]
    pub title: String, // 4 + N

    #[max_len(500)]
    pub description: String, // 4 + N

    pub job_id: u64,     // 8  - from client_profile.job_counter
    pub created_at: i64, // 8  - unix timestamp at creation
    pub bump: u8,        // 1  - canonical PDA bump
}

impl JobAccount {
    pub fn space(title_len: usize, desc_len: usize) -> usize {
        8                   // discriminator
        + 32                // client
        + 33                // freelancer: Option<Pubkey>
        + 8                 // amount
        + 1                 // status
        + 8                 // job_id
        + (4 + title_len)   // title
        + (4 + desc_len)    // description
        + 8                 // created_at
        + 1 // bump
    }
}

// ─── JobStatus ────────────────────────────────────────────────────────────────
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

// ─── ClientProfile ────────────────────────────────────────────────────────────
#[account]
#[derive(Debug)]
pub struct ClientProfile {
    pub client: Pubkey,   // 32
    pub job_counter: u64, // 8  - next job_id (monotonic)
    pub total_spent: u64, // 8  - lifetime lamports paid out
    pub active_jobs: u32, // 4  - currently open/in-progress/delivered jobs
    pub bump: u8,         // 1
}

impl ClientProfile {
    pub const SPACE: usize = 8 + 32 + 8 + 8 + 4 + 1;
}

// ─── FreelancerProfile ────────────────────────────────────────────────────────
#[account]
#[derive(Debug, InitSpace)]
pub struct FreelancerProfile {
    pub freelancer: Pubkey,  // 32
    pub gig_counter: u64,    // 8
    pub jobs_completed: u64, // 8 - incremented by release_payment
    pub total_earned: u64,   // 8 - lamports received, updated by release_payment
    pub rating_sum: u64,     // 8
    pub rating_count: u64,   // 8
    pub bump: u8,            // 1
}

impl FreelancerProfile {
    pub const SPACE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 1;
}

// ─── RoleRegistry ─────────────────────────────────────────────────────────────
#[account]
pub struct RoleRegistry {
    pub wallet: Pubkey, // 32 - wallet this registry belongs to
    pub role: UserRole, // 1
    pub bump: u8,       // 1  - canonical PDA bump
}

impl RoleRegistry {
    pub const SPACE: usize = 8 + 32 + 1 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum UserRole {
    Client,
    Freelancer,
}

// ─── GigAccount ───────────────────────────────────────────────────────────────
#[account]
pub struct GigAccount {
    pub freelancer: Pubkey,
    pub gig_id: u64,
    pub title: String,
    pub basic_price: u64,
    pub standard_price: u64,
    pub premium_price: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub metadata_uri: String,
    pub bump: u8,
}

impl GigAccount {
    pub fn space(title_len: usize, uri_len: usize) -> usize {
        8 + 32 + 8 + (4 + title_len) + 8 + 8 + 8 + 1 + 8 + (4 + uri_len) + 1
    }
}
