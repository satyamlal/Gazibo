#[cfg(test)]
mod gazibo_tests {
    use anchor_lang::AccountDeserialize;
    use borsh::BorshSerialize;
    use litesvm::LiteSVM;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        signature::{Keypair, Signer},
        system_program,
        transaction::Transaction,
    };
    use std::str::FromStr;

    use gazibo::{
        constants::JOB_SEED,
        state::{JobAccount, JobStatus},
    };

    const PROGRAM_ID_STR: &str = "YOUR_PROGRAM_ID_HERE";

    fn program_id() -> Pubkey {
        Pubkey::from_str(PROGRAM_ID_STR).unwrap()
    }

    fn setup_svm() -> LiteSVM {
        let mut svm = LiteSVM::new();
        svm.add_program_from_file(program_id(), "target/deploy/gazibo.so")
            .expect("Program .so not found. Run `anchor build` or `cargo build-sbf` first.");
        svm
    }

    fn derive_job_pda(client: &Pubkey, job_id: u64) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[JOB_SEED, client.as_ref(), &job_id.to_le_bytes()],
            &program_id(),
        )
    }

    fn ix_discriminator(namespace: &str) -> [u8; 8] {
        let hash = anchor_lang::solana_program::hash::hashv(&[namespace.as_bytes()]);
        let mut disc = [0u8; 8];
        disc.copy_from_slice(&hash.to_bytes()[..8]);
        disc
    }

    #[derive(BorshSerialize)]
    struct CreateJobArgs {
        job_id: u64,
        title: String,
        description: String,
        amount: u64,
    }

    fn create_job_ix_data(job_id: u64, title: &str, description: &str, amount: u64) -> Vec<u8> {
        let mut data = ix_discriminator("global:create_job").to_vec();
        let args = CreateJobArgs {
            job_id,
            title: title.to_string(),
            description: description.to_string(),
            amount,
        };
        let mut serialized = Vec::new();
        args.serialize(&mut serialized).unwrap();
        data.extend(serialized);
        data
    }

    fn accept_job_ix_data() -> Vec<u8> {
        ix_discriminator("global:accept_job").to_vec()
    }

    fn deliver_job_ix_data() -> Vec<u8> {
        ix_discriminator("global:deliver_job").to_vec()
    }

    fn release_payment_ix_data() -> Vec<u8> {
        ix_discriminator("global:release_payment").to_vec()
    }

    fn cancel_job_ix_data() -> Vec<u8> {
        ix_discriminator("global:cancel_job").to_vec()
    }

    fn create_job(svm: &mut LiteSVM, client: &Keypair, job_id: u64, amount: u64) -> Pubkey {
        let pid = program_id();
        let (pda, _) = derive_job_pda(&client.pubkey(), job_id);

        let ix = Instruction {
            program_id: pid,
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
            data: create_job_ix_data(job_id, "Test Job", "Test Description", amount),
        };

        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[client],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("create_job failed");
        pda
    }

    fn accept_job(svm: &mut LiteSVM, job_pda: Pubkey, freelancer: &Keypair) {
        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(job_pda, false),
                AccountMeta::new_readonly(freelancer.pubkey(), true),
            ],
            data: accept_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&freelancer.pubkey()),
            &[freelancer],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("accept_job failed");
    }

    fn deliver_job(svm: &mut LiteSVM, job_pda: Pubkey, freelancer: &Keypair) {
        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(job_pda, false),
                AccountMeta::new_readonly(freelancer.pubkey(), true),
            ],
            data: deliver_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&freelancer.pubkey()),
            &[freelancer],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("deliver_job failed");
    }

    fn get_job(svm: &LiteSVM, pda: &Pubkey) -> JobAccount {
        let raw = svm.get_account(pda).expect("account not found");
        JobAccount::try_deserialize(&mut raw.data.as_slice()).expect("deserialization failed")
    }

    #[test]
    fn test_create_job_success() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let job_id = 42u64;
        let amount = 2_000_000_000u64;
        let pda = create_job(&mut svm, &client, job_id, amount);

        let job = get_job(&svm, &pda);
        assert_eq!(job.client, client.pubkey());
        assert_eq!(job.amount, amount);
        assert_eq!(job.status, JobStatus::Open);
        assert_eq!(job.freelancer, None);
        assert_eq!(job.job_id, job_id);

        let account_lamports = svm.get_account(&pda).unwrap().lamports;
        assert!(
            account_lamports >= amount,
            "PDA should hold at least the job amount"
        );
    }

    #[test]
    fn test_full_happy_path() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer = Keypair::new();

        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer.pubkey(), 1_000_000_000).unwrap();

        let pda = create_job(&mut svm, &client, 1, 3_000_000_000);
        accept_job(&mut svm, pda, &freelancer);
        deliver_job(&mut svm, pda, &freelancer);

        let pre_freelancer_bal = svm.get_account(&freelancer.pubkey()).unwrap().lamports;
        let pre_client_bal = svm.get_account(&client.pubkey()).unwrap().lamports;
        let job_lamports = svm.get_account(&pda).unwrap().lamports;

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new(freelancer.pubkey(), false),
            ],
            data: release_payment_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("release_payment failed");

        assert!(
            svm.get_account(&pda).is_none(),
            "job_account should be closed"
        );

        let post_freelancer_bal = svm.get_account(&freelancer.pubkey()).unwrap().lamports;
        assert_eq!(
            post_freelancer_bal,
            pre_freelancer_bal + 3_000_000_000,
            "Freelancer should receive exactly the job amount"
        );

        let post_client_bal = svm.get_account(&client.pubkey()).unwrap().lamports;
        let rent_back = job_lamports - 3_000_000_000;

        assert!(
            post_client_bal >= pre_client_bal + rent_back - 10_000,
            "Client should get rent back"
        );
    }

    #[test]
    fn test_cancel_open_job_refunds_client() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let amount = 2_000_000_000u64;
        let pda = create_job(&mut svm, &client, 1, amount);
        let pre_bal = svm.get_account(&client.pubkey()).unwrap().lamports;

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new(client.pubkey(), true),
            ],
            data: cancel_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("cancel_job failed");

        assert!(svm.get_account(&pda).is_none(), "account should be closed");

        let post_bal = svm.get_account(&client.pubkey()).unwrap().lamports;

        assert!(
            post_bal > pre_bal,
            "Client balance should increase after cancel (refund > tx fee)"
        );
    }

    #[test]
    fn test_amount_too_low_rejected() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let (pda, _) = derive_job_pda(&client.pubkey(), 1);
        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
            data: create_job_ix_data(1, "Job", "Desc", 999),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        assert!(
            svm.send_transaction(tx).is_err(),
            "Should reject: amount too low"
        );
    }

    #[test]
    fn test_client_cannot_accept_own_job() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let pda = create_job(&mut svm, &client, 1, 2_000_000_000);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new_readonly(client.pubkey(), true),
            ],
            data: accept_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        assert!(
            svm.send_transaction(tx).is_err(),
            "Should reject: self-hire"
        );
    }

    #[test]
    fn test_double_accept_rejected() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer1 = Keypair::new();
        let freelancer2 = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer1.pubkey(), 1_000_000_000).unwrap();
        svm.airdrop(&freelancer2.pubkey(), 1_000_000_000).unwrap();

        let pda = create_job(&mut svm, &client, 1, 2_000_000_000);
        accept_job(&mut svm, pda, &freelancer1);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new_readonly(freelancer2.pubkey(), true),
            ],
            data: accept_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&freelancer2.pubkey()),
            &[&freelancer2],
            svm.latest_blockhash(),
        );
        assert!(
            svm.send_transaction(tx).is_err(),
            "Should reject: job already taken"
        );
    }

    #[test]
    fn test_wrong_freelancer_cannot_deliver() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer = Keypair::new();
        let impostor = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer.pubkey(), 1_000_000_000).unwrap();
        svm.airdrop(&impostor.pubkey(), 1_000_000_000).unwrap();

        let pda = create_job(&mut svm, &client, 1, 2_000_000_000);
        accept_job(&mut svm, pda, &freelancer);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new_readonly(impostor.pubkey(), true),
            ],
            data: deliver_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&impostor.pubkey()),
            &[&impostor],
            svm.latest_blockhash(),
        );
        assert!(
            svm.send_transaction(tx).is_err(),
            "Should reject: wrong freelancer"
        );
    }

    #[test]
    fn test_cancel_after_accept_rejected() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer.pubkey(), 1_000_000_000).unwrap();

        let pda = create_job(&mut svm, &client, 1, 2_000_000_000);
        accept_job(&mut svm, pda, &freelancer);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new(client.pubkey(), true),
            ],
            data: cancel_job_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        assert!(
            svm.send_transaction(tx).is_err(),
            "CRITICAL: Client must NOT cancel after freelancer accepted"
        );
    }

    #[test]
    fn test_cannot_skip_delivery_step() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer.pubkey(), 1_000_000_000).unwrap();

        let pda = create_job(&mut svm, &client, 1, 2_000_000_000);
        accept_job(&mut svm, pda, &freelancer);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(pda, false),
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new(freelancer.pubkey(), false),
            ],
            data: release_payment_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        assert!(
            svm.send_transaction(tx).is_err(),
            "Should reject: delivery not confirmed"
        );
    }
}
