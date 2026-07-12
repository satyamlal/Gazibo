# Gazibo - onChain Solana based freelace platform

## Terminal 1: Restart your localnet from scratch to prevent any state conflicts.
solana-test-validator --reset

## Terminal 2: Ensure you are in the root directory (/mnt/c/Users/ssaty/SolanaDevelopment/gazibo)
# Step 1: Compiles the Rust code into a fresh BPF .so binary and generates a new IDL.
anchor build 

# Step 2: Uploads the newly compiled binary to the local validator.
anchor deploy

# Step 3: Switch to the app folder and run the client script.
cd app
npm start