#[cfg(test)]
mod gazibo_tests {
    use anchor_lang::system_program;
    use anchor_lang::AccountDeserialize;
    use borsh::BorshSerialize;
    use litesvm::LiteSVM;
    use solana_sdk::{
        hash,
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        signature::{Keypair, Signer},
        transaction::Transaction,
    };
    use std::path::PathBuf;
    use std::str::FromStr;

    use gazibo::{
        constants::{CLIENT_PROFILE_SEED, JOB_SEED},
        state::{ClientProfile, JobAccount, JobStatus},
    };

    const PROGRAM_ID_STR: &str = "5bTvxVfSwqy7FApuPfHiXBWihZSmLSQNsGwVebNeLj7D";

    fn program_id() -> Pubkey {
        Pubkey::from_str(PROGRAM_ID_STR).unwrap()
    }

    fn setup_svm() -> LiteSVM {
        let mut svm = LiteSVM::new();
        let mut program_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
        program_path.push("../../target/deploy/gazibo.so");
        svm.add_program_from_file(program_id(), program_path)
            .expect("Run `anchor build` first");
        svm
    }

    fn derive_client_profile_pda(client: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[CLIENT_PROFILE_SEED, client.as_ref()], &program_id())
    }

    fn derive_job_pda(client: &Pubkey, job_id: u64) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[JOB_SEED, client.as_ref(), &job_id.to_le_bytes()],
            &program_id(),
        )
    }

    fn ix_discriminator(namespace: &str) -> [u8; 8] {
        let hash = hash::hashv(&[namespace.as_bytes()]);
        let mut disc = [0u8; 8];
        disc.copy_from_slice(&hash.to_bytes()[..8]);
        disc
    }

    fn initialize_client_ix_data() -> Vec<u8> {
        ix_discriminator("global:initialize_client").to_vec()
    }

    #[derive(BorshSerialize)]
    struct CreateJobArgs {
        title: String,
        description: String,
        amount: u64,
        job_id: u64,
    }
    fn create_job_ix_data(title: &str, description: &str, amount: u64, job_id: u64) -> Vec<u8> {
        let mut data = ix_discriminator("global:create_job").to_vec();
        let args = CreateJobArgs {
            title: title.to_string(),
            description: description.to_string(),
            amount,
            job_id,
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

    fn initialize_client(svm: &mut LiteSVM, client: &Keypair) -> Pubkey {
        let (profile_pda, _) = derive_client_profile_pda(&client.pubkey());

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new(profile_pda, false),
                AccountMeta::new_readonly(
                    Pubkey::new_from_array(system_program::ID.to_bytes()),
                    false,
                ),
            ],
            data: initialize_client_ix_data(),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[client],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("initialize_client failed");
        profile_pda
    }

    fn create_job(
        svm: &mut LiteSVM,
        client: &Keypair,
        profile_pda: Pubkey,
        amount: u64,
    ) -> (Pubkey, u64) {
        let profile_account = svm.get_account(&profile_pda).expect("profile not found");
        let profile = ClientProfile::try_deserialize(&mut profile_account.data.as_slice())
            .expect("profile deserialize failed");
        let job_id = profile.job_counter;

        let (job_pda, _) = derive_job_pda(&client.pubkey(), job_id);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(profile_pda, false),
                AccountMeta::new(job_pda, false),
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new_readonly(
                    Pubkey::new_from_array(system_program::ID.to_bytes()),
                    false,
                ),
            ],
            data: create_job_ix_data("Test Job", "Test Description", amount, job_id),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[client],
            svm.latest_blockhash(),
        );
        svm.send_transaction(tx).expect("create_job failed");
        (job_pda, job_id)
    }

    fn accept_job(svm: &mut LiteSVM, job_pda: Pubkey, freelancer: &Keypair) {
        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(freelancer.pubkey(), true),
                AccountMeta::new(job_pda, false),
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
                AccountMeta::new(freelancer.pubkey(), true),
                AccountMeta::new(job_pda, false),
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
        JobAccount::try_deserialize(&mut raw.data.as_slice()).expect("deserialize failed")
    }

    fn get_profile(svm: &LiteSVM, pda: &Pubkey) -> ClientProfile {
        let raw = svm.get_account(pda).expect("profile not found");
        ClientProfile::try_deserialize(&mut raw.data.as_slice()).expect("deserialize failed")
    }

    #[test]
    fn test_initialize_client_success() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let profile_pda = initialize_client(&mut svm, &client);

        let profile = get_profile(&svm, &profile_pda);
        assert_eq!(profile.client.to_bytes(), client.pubkey().to_bytes());
        assert_eq!(profile.job_counter, 0);
        assert_eq!(profile.total_spent, 0);
        assert_eq!(profile.active_jobs, 0);
    }

    #[test]
    fn test_counter_increments_per_job() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 50_000_000_000).unwrap();

        let profile_pda = initialize_client(&mut svm, &client);

        let (_, job_id_0) = create_job(&mut svm, &client, profile_pda, 1_000_000_000);
        assert_eq!(job_id_0, 0);
        assert_eq!(get_profile(&svm, &profile_pda).job_counter, 1);

        let (_, job_id_1) = create_job(&mut svm, &client, profile_pda, 1_000_000_000);
        assert_eq!(job_id_1, 1);
        assert_eq!(get_profile(&svm, &profile_pda).job_counter, 2);
    }

    #[test]
    fn test_full_happy_path() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer.pubkey(), 1_000_000_000).unwrap();

        let profile_pda = initialize_client(&mut svm, &client);
        let (job_pda, _) = create_job(&mut svm, &client, profile_pda, 3_000_000_000);
        accept_job(&mut svm, job_pda, &freelancer);
        deliver_job(&mut svm, job_pda, &freelancer);

        let pre_freelancer_bal = svm.get_account(&freelancer.pubkey()).unwrap().lamports;

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(job_pda, false),
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
            svm.get_account(&job_pda).is_none(),
            "job_account should be closed"
        );

        let post_freelancer_bal = svm.get_account(&freelancer.pubkey()).unwrap().lamports;
        assert_eq!(post_freelancer_bal, pre_freelancer_bal + 3_000_000_000);
    }

    #[test]
    fn test_cancel_refunds_client() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let profile_pda = initialize_client(&mut svm, &client);
        let (job_pda, _) = create_job(&mut svm, &client, profile_pda, 2_000_000_000);

        let pre_bal = svm.get_account(&client.pubkey()).unwrap().lamports;

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new(job_pda, false),
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

        assert!(svm.get_account(&job_pda).is_none());
        let post_bal = svm.get_account(&client.pubkey()).unwrap().lamports;
        assert!(post_bal > pre_bal, "Client gets amount + rent back");
    }

    #[test]
    fn test_cannot_create_job_without_profile() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();

        let (profile_pda, _) = derive_client_profile_pda(&client.pubkey());
        let (job_pda, _) = derive_job_pda(&client.pubkey(), 0);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(profile_pda, false),
                AccountMeta::new(job_pda, false),
                AccountMeta::new(client.pubkey(), true),
                AccountMeta::new_readonly(
                    Pubkey::new_from_array(system_program::ID.to_bytes()),
                    false,
                ),
            ],
            data: create_job_ix_data("Job", "Desc", 2_000_000_000, 0),
        };
        let tx = Transaction::new_signed_with_payer(
            &[ix],
            Some(&client.pubkey()),
            &[&client],
            svm.latest_blockhash(),
        );
        assert!(svm.send_transaction(tx).is_err(), "Should fail: no profile");
    }

    #[test]
    fn test_cancel_after_accept_rejected() {
        let mut svm = setup_svm();
        let client = Keypair::new();
        let freelancer = Keypair::new();
        svm.airdrop(&client.pubkey(), 10_000_000_000).unwrap();
        svm.airdrop(&freelancer.pubkey(), 1_000_000_000).unwrap();

        let profile_pda = initialize_client(&mut svm, &client);
        let (job_pda, _) = create_job(&mut svm, &client, profile_pda, 2_000_000_000);
        accept_job(&mut svm, job_pda, &freelancer);

        let ix = Instruction {
            program_id: program_id(),
            accounts: vec![
                AccountMeta::new(job_pda, false),
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
            "CRITICAL: cannot cancel after accept"
        );
    }
}
