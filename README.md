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
- **Wallet adapter** support for Phantom or Solflare.
- **npm** for the frontend and app packages.

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

This project is intended to run on **Linux or WSL**.

If you are using WSL, keep the repository inside the Linux filesystem, such as:

```bash
$ /home/<your-user>/projects/gazibo
```

Do **not** place it under a Windows-mounted path like `/mnt/c/...` for local validator work. Solana local validator tooling depends on Unix sockets and works reliably from the Linux filesystem.

## Installation

Clone the repository:

```bash
$ git clone https://github.com/satyamlal/Gazibo.git
$ cd Gazibo
```

## Install Dependencies

Install the frontend dependencies:

```bash
$ cd frontend
$ npm install
```

If you want to use the standalone client app:

```bash
$ cd ../app
$ npm install
```

## Run the Local Validator

Start a local Solana validator in a separate terminal:

```bash
$ cd ~
$ solana-test-validator --reset
```

Keep this terminal open while developing.

## Build and Deploy the Program

From the repository root:

```bash
$ anchor build
$ anchor deploy
```

If you change the on-chain program, rebuild and redeploy it before testing the frontend again.

## Start the Frontend

From the `frontend/` directory:

```bash
$ npm run dev
```

Open the app at:

```bash
$ http://localhost:3000
```

## Wallet Setup

To use the app locally:

- Open Phantom or Solflare.
- Switch the wallet to the **Localhost** network.
- Connect the wallet to the app.

If needed, fund the wallet with local SOL using the Solana CLI:

```bash
$ solana airdrop 10 <wallet-address>
```

## Project Notes

- `frontend/src/idl/gazibo.json` contains the program IDL used by the UI.
- `programs/gazibo/` contains the Anchor program logic.
- `migrations/deploy.ts` can be used for deployment-related scripting.
- `app/src/client.ts` is a standalone client entry point.

## Development Workflow

A typical local development flow looks like this:

1. Start the local validator.
2. Build and deploy the Anchor program.
3. Start the frontend.
4. Connect a local wallet.
5. Test the escrow flow end to end.

## Contributing

Contributions are welcome.

### Before you contribute

- Use **Linux or WSL only**.
- Keep the repo in the Linux filesystem when using WSL.
- Make sure the program builds before opening a pull request.
- Avoid committing generated build artifacts such as `.next/`, `target/`, or local validator data.

### How to contribute

1. Fork the repository.
```
$ git clone https://github.com/<your-username>/Gazibo.git
$ cd Gazibo
$ git remote add upstream https://github.com/satyamlal/Gazibo.git
```

2. Create a new branch for your change.
```
$ git checkout -b feat/your-feature-name
```

3. Make your changes in a focused commit.
```
$ git status
$ git add .
$ git commit -m "feat: describe your change"
```

Please keep your commits smaller and cleaner, stage only the files related to one change at a time:
```
$ git add path/to/file1 path/to/file2
$ git commit -m "fix: update escrow flow validation"
```

4. Test the program and frontend locally.
Run the validator in one terminal-1:
```
$ cd ~
$ solana-test-validator --reset
```

Build and deploy the program in terminal-2 from the repo root:
```
$ anchor build
$ anchor deploy
```

Start the frontend
```
$ cd frontend
$ npm install
$ npm run dev
```

5. Submit a pull request with a clear explanation of your changes.
```
$ git push -u origin feat/your-feature-name
```


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