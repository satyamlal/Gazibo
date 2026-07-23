use anchor_lang::prelude::*;

#[constant]
pub const JOB_SEED: &[u8] = b"job";
pub const CLIENT_PROFILE_SEED: &[u8] = b"client_profile";
pub const FREELANCER_PROFILE_SEED: &[u8] = b"freelancer_profile";
pub const GIG_SEED: &[u8] = b"gig";

pub const MAX_TITLE_LENGTH: usize = 50;
pub const MAX_DESC_LENGTH: usize = 500;
pub const MAX_GIG_TITLE_LENGTH: usize = 80;
pub const MAX_METADATA_URI_LEN: usize = 100;

pub const MIN_AMOUNT_LAMPORTS: u64 = 1_000_000; //0.001 SOL = 1_000_000 lamports
