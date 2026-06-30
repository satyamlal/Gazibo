use {
    anchor_lang::{
        prelude::Pubkey, solana_program::instruction::Instruction, InstructionData, ToAccountMetas,
    },
    litesvm::LiteSVM,
    solana_keypair::Keypair,
    solana_message::{Message, VersionedMessage},
    solana_signer::Signer,
    solana_transaction::versioned::VersionedTransaction,
    std::{fs, path::PathBuf},
};

#[test]
fn test_initialize() {
    let program_id = gazibo::id();
    let payer = Keypair::new();
    let client = payer.pubkey();
    let title = String::from("Website design");
    let amount = 1_000_000;
    let job_id: u64 = 1;
    let (job, _) = Pubkey::find_program_address(
        &[gazibo::JOB_SEED, client.as_ref(), &job_id.to_le_bytes()],
        &program_id,
    );
    let mut svm = LiteSVM::new();
    let program_path =
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../target/deploy/gazibo.so");
    let bytes = fs::read(program_path).unwrap();
    svm.add_program(program_id, bytes.as_slice()).unwrap();
    svm.airdrop(&payer.pubkey(), 1_000_000_000).unwrap();

    let instruction = Instruction::new_with_bytes(
        program_id,
        &gazibo::instruction::CreateJob {
            title: title.clone(),
            amount,
            job_id,
        }
        .data(),
        gazibo::accounts::CreateJob {
            client,
            job,
            system_program: anchor_lang::system_program::ID,
        }
        .to_account_metas(None),
    );

    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[instruction], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), &[payer]).unwrap();

    let res = svm.send_transaction(tx);
    assert!(res.is_ok());
}
