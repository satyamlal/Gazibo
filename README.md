# Gazibo — Solana Freelance Escrow Platform

Gazibo is a Solana-based freelance escrow application built with **Anchor** for the on-chain program and **Next.js** for the frontend.

The workflow is simple:

- A client creates a job and locks SOL in escrow.
- A freelancer accepts and works on the job.
- The client releases the payment after delivery is approved.

The smart contract enforces the escrow flow on-chain, while the frontend provides the user interface for wallet connection, job management, and protocol interaction.

## Tech Stack

- **Rust / Anchor** for the Solana program.
- **Solana CLI** for local validator and deployment.
- **Next.js / TypeScript** for the frontend.
- **Wallet adapter** support for Phantom.

## Repository Structure

```text
programs/gazibo/   On-chain Anchor program
frontend/          Next.js application
app/               Standalone client script for program interaction
```

## Requirements

Before you start, make sure you have the following installed on a **Linux system or WSL**:

- Rust installed through [`rustup`](https://rustup.rs/).
- Solana CLI.
- Anchor CLI installed through `avm`.
- Node.js 18+.
- npm.
- Phantom or Solflare wallet extension.

## Linux / WSL Only

This project is intended to run on **Linux or VScode remotely connected to WSL**.

If you are using WSL, keep the repository inside the Linux filesystem, such as:

```bash
$ /home/<username>/projects/gazibo
```

Do **not** place it under a Windows-mounted path like `/mnt/c/...` for local validator work. Solana local validator tooling depends on Unix sockets and works reliably from the Linux filesystem.

### Before you contribute

- Use **Linux or WSL only**.
- Keep the repo in the Linux filesystem when using WSL.
- Make sure the program builds before opening a pull request.
- Avoid committing generated build artifacts such as `.next/`, `target/`, or local validator data.

## Contributing

## Installation
- First fork the repo
- Clone the repository:

```bash
$ git clone https://github.com/{username}/Gazibo.git
$ cd Gazibo
```

## Install Dependencies

Install the frontend dependencies:

```bash
$ cd frontend
$ npm install
```

## Run the dApp

### Run the Local Validator

Terminal-1(Keep this terminal open): 

Start a local Solana validator in a separate terminal:
    
```bash
    $ cd ~/home/<username>/projects/gazibo
    $ solana-test-validator --reset
```
NOTE: Every time you use --reset, it will wipe out everything from your local validator logs, so you need to airdrop some balance to create gigs and jobs for testing dApp.

Terminal-2:
    - Build and Deploy the Program

```bash
    $ cd ~/home/<username>/projects/gazibo
    $ anchor build
    $ anchor deploy
    $ cp target/idl/gazibo.json frontend/src/idl/gazibo.json
    $ solana airdrop 5000 <Your Phantom Wallet Address>
```
If you change the on-chain program, rebuild and redeploy it before testing the frontend again.
NOTE: If you use 'cargo clean' in the root directory then use this command to find your ProgramID:
```
    $ solana-keygen pubkey target/deploy/gazibo-keypair.json
    Now change the ProgramID in
        - Anchor.toml: gazibo = "<YOUR_PROGRAM_ID>"
        - lib.rs: declare_id!("<YOUR_PROGRAM_ID>"); 
```

## Start the Frontend

From the `frontend/` directory:

```bash
$ npm run dev
```

Open the app at:

```bash
$ http://localhost:3000
```

Please keep your commits smaller and cleaner, stage only the files related to one change at a time:
```bash
    $ git add path/to/file1 path/to/file2
    $ git commit -m "fix: update escrow flow validation"
```

Submit a pull request with a clear explanation of your changes.
```bash
    $ git push -u origin feat/your-feature-name
```

## Wallet Setup

To use the app locally:

- Open Phantom.
- Switch the wallet to **Localnet**.
- Connect the wallet to the app.
- Airdrop some SOL using Solana CLI

```bash
$ solana airdrop 10 <wallet-address>
```

## Development Workflow

A typical local development flow looks like this:

1. Start the local validator.
2. Build and deploy the Anchor program.
3. Start the frontend.
4. Connect a local wallet.
5. Test the escrow flow end to end.


### Good contribution areas

- Bug fixes in the Anchor program.
- Frontend improvements.
- Better wallet and UX handling.
- Documentation improvements.
- Tests and deployment scripts.


## Acknowledgements

Built with:

- [Anchor](https://www.anchor-lang.com/)
- [Solana](https://solana.com/)
- [Next.js](https://nextjs.org/)