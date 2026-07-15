# Gazibo — Solana Freelance Escrow Platform

Gazibo is an on-chain freelance escrow dApp built with Anchor (Rust) and Next.js. Clients lock SOL into escrow when posting a job; freelancers accept and deliver; clients release payment on approval — all enforced by the on-chain program.

This guide gets the full stack (local validator + Anchor program + Next.js frontend) running from a clean clone.

## Prerequisites

- **Rust**, installed via [rustup](https://rustup.rs). This repo pins the exact compiler version via `rust-toolchain.toml` (currently `1.89.0`) — rustup will fetch it automatically the first time you build, you don't need to install it manually.
- **Solana CLI**
- **Anchor CLI**, installed and version-managed via `avm` (`cargo install --git https://github.com/coral-xyz/anchor avm --locked --force`)
- **Node.js 18+**
- **Phantom** or **Solflare** browser extension

---

## ⚠️ Read this first if you're on WSL

If your project folder is under `/mnt/c/...` (i.e. it's on your Windows drive, opened from WSL), `solana-test-validator` **will fail to start**, hanging on "Initializing..." and then erroring with:

```
⠒ Unable to connect to validator: Client error: test-ledger/admin.rpc does not exist
```

This isn't a project bug. WSL's Windows-drive mount (DrvFs) doesn't support Unix domain sockets, and the validator needs one (`admin.rpc`) to report that it's ready. If the ledger lives on `/mnt/c/...`, that socket can never be created.

**Fix — always launch the validator from your Linux home directory, not the project folder:**

```bash
cd ~
solana-test-validator --reset
```

The validator doesn't need to sit inside the project — it's a standalone process everything else talks to over RPC (`http://127.0.0.1:8899`). Your code stays on `/mnt/c/...`; only the ledger location changes.

---

## 1. Clone and install

```bash
git clone https://github.com/satyamlal/Gazibo.git
cd Gazibo
```

This repo has two independent JS dependency trees — use the right manager for each:

| Location | Package manager | What it's for |
|---|---|---|
| repo root | `yarn` | Anchor's own tooling (prettier, mocha/chai — not currently used, no tests exist yet) |
| `frontend/` | `npm` | The actual Next.js dApp |

You only need `frontend/`'s dependencies to run the app — that's Step 4 below.

---

## 2. Terminal 1 — Local validator

```bash
cd ~
solana-test-validator --reset
```

- `--reset` wipes the local ledger and starts from a fresh genesis block on every run — no stale accounts, no stale program deployments, no stale balances.
- Leave this running in its own terminal for the rest of the session.

---

## 3. Terminal 2 — Build and deploy the program

**One-time setup** — install the exact Anchor CLI version this repo is pinned to (see `Anchor.toml`'s `[toolchain]` block):

```bash
avm install 0.31.1
```

This compiles Anchor CLI from source and can take several minutes — that's normal. You shouldn't need to run `avm use` afterward: because the version is pinned in `Anchor.toml`, the `anchor` command auto-selects `0.31.1` whenever you run it inside this repo. If you ever see an "anchor-lang version / CLI version don't match" warning anyway, run `avm use 0.31.1` manually as a fallback.

**Every time you change the Rust program:**

```bash
cd /path/to/Gazibo
anchor build
anchor deploy
cp target/idl/gazibo.json frontend/src/idl/gazibo.json
```

Do **not** add `RUSTC_BOOTSTRAP` or `RUSTFLAGS` to this command. See the troubleshooting table below for why.

---

## 4. Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## 5. Connect your wallet to the local validator

Phantom and Solflare point at Mainnet or Devnet by default — you have to explicitly tell them about your local validator:

1. Open Phantom → **Settings → Developer Settings** → turn on **Testnet Mode**.
2. In the network switcher, select **Localhost** (`http://127.0.0.1:8899`).
3. Click **Connect** in the Gazibo app.

---

## 6. Checking your balance / airdropping from the terminal

Balance checks and airdrops only ever need your wallet's **public address** — never your password or private key. Phantom only asks for a password to unlock its UI or to *sign* a transaction; neither of those is a signature.

**First, point the CLI at your local validator once, so you don't need `--url` on every command:**

```bash
solana config set --url http://127.0.0.1:8899
```

### Option A — simplest, recommended

Copy your address once from Phantom (click your account name → Copy Address), then save it as a variable so you never have to paste it again:

```bash
export GAZIBO_WALLET="<paste your Phantom address here>"
```

Add that line to `~/.bashrc` (or `~/.zshrc`) to keep it across terminal sessions. Then:

```bash
solana balance $GAZIBO_WALLET
solana airdrop 10 $GAZIBO_WALLET
```

### Option B — unify your CLI and Phantom identity (optional)

Import Phantom's Secret Recovery Phrase into a local Solana CLI keypair file, so `solana balance` and `solana airdrop` work with **no arguments at all**, and it's the exact same wallet your browser is using.

> ⚠️ **Only do this with a wallet you use purely for localnet testing.** This writes your private key to a plaintext file on disk. Never do it with a seed phrase that holds real funds.

```bash
solana-keygen recover 'prompt:?key=0/0' --outfile ~/.config/solana/phantom-local.json
```

This prompts you to paste your Secret Recovery Phrase (Phantom → Settings → Security & Privacy → Show Secret Recovery Phrase), shows you the recovered public key, and asks you to confirm before writing the file. Then:

```bash
solana config set --keypair ~/.config/solana/phantom-local.json
solana balance
solana airdrop 10
```

---

## Troubleshooting

| Error signature | Real root cause | Fix |
|---|---|---|
| `Unable to connect to validator: ... admin.rpc does not exist` | Validator was launched from a `/mnt/c/...` path — Unix sockets aren't supported on WSL's Windows-drive mount. | `cd ~` before running `solana-test-validator --reset`. |
| `connect ECONNREFUSED 127.0.0.1:8899` | The validator isn't running, or it silently failed to start. | Check Terminal 1 for the error above; start/restart it from `~`. |
| `Attempt to load a program that does not exist` | Program compiled but was never deployed to *this* validator instance — common right after `--reset`, which wipes deployed programs too. | `anchor build && anchor deploy` |
| `Attempt to debit an account but found no record of a prior credit` | The signing wallet has zero SOL on this validator — usually because `--reset` wiped every balance and you haven't re-airdropped since. | Airdrop to the exact connected wallet address (§6). |
| `AnchorError ... JobNotOpen` / `JobNotInProgress` / `JobNotDelivered` / `JobNotCancellable` / `UnauthorizedFreelancer` / `NotJobClient` / etc. | **Not a bug.** These are the program correctly rejecting an instruction called in the wrong order — e.g. releasing payment before delivery, or someone other than the assigned freelancer trying to deliver. Full list in `programs/gazibo/src/error.rs`. | Fix the call order on the client. Only redeploy (`anchor build && anchor deploy`) if you're certain the sequence is correct and it still throws. |
| `error[E0425]: cannot find type 'SourceFile' in crate 'proc_macro'` while compiling `proc-macro2` | Caused by manually setting `RUSTC_BOOTSTRAP=1 RUSTFLAGS="--cfg procmacro2_semver_exempt"`. This forces `proc-macro2` down a nightly-only path that calls compiler APIs removed from Rust long ago. | Don't set these environment variables — run plain `anchor build`. |
| `failed to select a version for solana-sdk` / litesvm build errors (`agave_feature_set::FeatureSet` type mismatch, `MessageProcessor` not found, etc.) | Solana's ecosystem crates broke semver mid-2.x-line when `agave-feature-set` split off from `solana-feature-set`. `litesvm 0.5.0` was tested against `solana-program-runtime 2.1.10`; a loose caret range lets Cargo silently resolve a newer, incompatible patch. | Already fixed — `programs/gazibo/Cargo.toml` pins `solana-program-runtime`, `solana-svm`, `solana-bpf-loader-program`, `solana-fee`, `solana-runtime-transaction`, and `solana-sdk` to exactly `=2.1.10`. If this resurfaces after adding a new dependency, check what version it pulled — don't delete `Cargo.lock` or any tests as a shortcut. |
| Hydration mismatch involving `WalletMultiButton` or any wallet-adapter UI component | Server-rendered HTML doesn't match the client's first render, because wallet-adapter components read `localStorage` (browser-only) to check for a previously connected wallet. | Import the component with `next/dynamic` and `{ ssr: false }` so it never renders on the server. |
| `anchor-lang version(...) and the current CLI version(...) don't match` warning | Anchor CLI isn't using the version pinned for this repo. | Run `avm install <version from Anchor.toml>` once (§3) — the `[toolchain]` block handles the rest automatically. |
| `error: binary 'anchor' already exists in destination` while running `avm install` | `avm` doesn't have permission to overwrite an `anchor` binary that wasn't installed through avm. | `rm -f ~/.cargo/bin/anchor`, then re-run `avm install 0.31.1`. |

---

## Project layout

```
programs/gazibo/   Rust/Anchor on-chain program
frontend/           Next.js app (npm) — the actual dApp
app/                 Standalone CLI script for scripting against the program directly (npm, optional)
```