use anchor_lang::prelude::*;

#[constant]
pub const JOB_SEED: &[u8] = b"job";
pub const MAX_TITLE_LENGTH: usize = 50;
pub const MAX_DESC_LENGTH: usize = 500;

pub const MIN_AMOUNT_LAMPORTS: u64 = 1_000_000; //0.001 SOL = 1_000_000 lamports