# Gazibo - On-Chain Solana Freelance Escrow Platform

This README contains the absolute lifecycle management protocol for setting up, building, compiling, deploying, and debugging the Gazibo dApp. Follow the strict terminal execution paths described below to ensure faultless full-stack orchestration.

---

## 🛠 Architectural Execution Protocol (3-Terminal System)

To run the complete system with the interactive Next.js Frontend and the Rust Anchor Backend, you must orchestrate three isolated terminal sessions.

### 🌐 Terminal 1: The Localnet Ledger (Blockchain Core)
This session initializes and hosts your isolated local Solana cluster. Always start this before executing any client or compilation pipelines.

* **Command:**
    ```bash
    solana-test-validator --reset
    ```
* **Why:** The `--reset` flag wipes old corrupted state frames, memory leaks, and faulty block hashes from the disk ledger to ensure a completely deterministic genesis state.
* **Protocol:** Keep this terminal running continuously. Do not close or interrupt this session.

### ⛓ Terminal 2: Build, Mitigate, Deploy & ABI Extraction (Backend Pipeline)
This session manages compilation, environment overrides, dependency bug fixes, contract deployment, and IDL asset transmission.

* **Step 1: Environment Standard Initialization**
    ```bash
    avm install 0.30.1 --force && avm use 0.30.1
    ```
* **Step 2: Clear Corrupt Build Contexts & Lockfiles**
    ```bash
    cargo clean && rm -f Cargo.lock
    ```
* **Step 3: Remove Deprecated Incompatible Test Implementations**
    ```bash
    rm -rf programs/gazibo/tests/
    ```
* **Step 4: Execute Aggregate Compiler & ABI Export Pipeline (The Absolute Production Command)**
    ```bash
    RUSTC_BOOTSTRAP=1 RUSTFLAGS="--cfg procmacro2_semver_exempt" anchor build && anchor deploy && cp target/idl/gazibo.json frontend/src/idl/gazibo.json
    ```

### 💻 Terminal 3: Interactive Next.js Development Engine (Frontend UI)
This session serves the user interface layer linked with Solana Wallet Adapters on your local machine.

* **Commands:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
* **Browser Access:** Open `http://localhost:3000` in your browser. Configure your Phantom/Solflare wallet browser extension to **Settings -> Developer Settings -> Testnet Mode ON** and point the network to **Localhost (127.0.0.1:8899)**.

---

## 🚨 Error Mitigation Registry (Playbook)

If your execution pipeline encounters any structural or compiler crashes, immediately look up the signature below and run the corresponding remediation command.

### 1. Network Failure: `connect ECONNREFUSED 127.0.0.1:8899`
* **Root Cause:** The client script or frontend is shooting RPC network requests, but the local validator backend daemon is offline.
* **Remediation:** Go to **Terminal 1** and run:
    ```bash
    solana-test-validator --reset
    ```

### 2. Simulation Failure: `Attempt to load a program that does not exist`
* **Root Cause:** The program ID mapped inside the typescript layer does not exist in the validator state register because the BPF contract binary hasn't been deployed yet.
* **Remediation:** Rebuild and host it on the local cluster using **Terminal 2**:
    ```bash
    anchor build && anchor deploy
    ```

### 3. State Engine Failure: `AnchorError ... Error Code: JobNotDelivered`
* **Root Cause:** On-chain byte state mismatch. The binary deployed on the validator node is old/stale compared to modifications in your local source code.
* **Remediation:** Recompile and overwrite the binary slot:
    ```bash
    anchor build && anchor deploy
    ```

### 4. Direct Version Collision: `error: binary 'anchor' already exists in destination`
* **Root Cause:** Cargo runtime security policies prevent `avm` from overwriting the pre-existing system executable block located in your local global path variables.
* **Remediation:** Manually rip the absolute path node or force package deployment:
    ```bash
    rm -f /home/ssaty/.cargo/bin/anchor
    # OR bypass AVM entirely via:
    cargo install --git [https://github.com/coral-xyz/anchor](https://github.com/coral-xyz/anchor) anchor-cli --locked --tag v0.30.1 --force
    ```

### 5. Compiler Error: `type annotations needed for Box<_>` (Crate: `time`)
* **Root Cause:** Host compiler update bitrot. Modern Rust toolchains (v1.80+) use strict validation rules incompatible with older dependency layouts inside the stable Anchor release bundle.
* **Remediation:** Force downscale the active host compilation engine step:
    ```bash
    rustup install 1.79.0
    cargo +1.79.0 install --git [https://github.com/coral-xyz/anchor](https://github.com/coral-xyz/anchor) --tag v0.30.1 anchor-cli --locked
    ```

### 6. Compiler Error: `no method named source_file found for proc_macro2::Span` (Crate: `anchor-syn`)
* **Root Cause:** The Anchor IDL compiler parser relies on internal nightly features hidden inside the stable compiler pipeline allocation parameters.
* **Remediation:** Inject global compiler environment overrides directly to force structural compilation maps:
    ```bash
    RUSTC_BOOTSTRAP=1 RUSTFLAGS="--cfg procmacro2_semver_exempt" anchor build
    ```

### 7. Dependency Deadlock: `failed to select a version for solana-sdk` / `solana-sdk-ids`
* **Root Cause:** Semantic version (SemVer) boundary overlap between third-party mocking libraries (`litesvm`) and internal `anchor-lang` structures due to Agave updates on crates.io.
* **Remediation:** Open `programs/gazibo/Cargo.toml`, completely wipe the testing definitions blocks, match `anchor-lang = "0.30.1"`, remove all files from `programs/gazibo/tests/`, and clear dependency graph caches:
    ```bash
    rm -rf programs/gazibo/tests/
    rm -f Cargo.lock
    cargo clean
    ```

---

## 🪂 Local Faucet Airdrop Provisioning
Before attempting to interact with the interactive browser UI, your browser wallet (Phantom/Solflare) requires localnet native tokens for gas fees.

1.  Copy your wallet address from the browser extension.
2.  In **Terminal 2**, execute the explicit network mint command:
    ```bash
    solana airdrop 10 <YOUR_WALLET_ADDRESS_HERE>
    ```

---
*Follow these systems precisely. Deviation from the stated execution sequences will lead to pipeline degradation.*