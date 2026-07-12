import * as anchor from "@coral-xyz/anchor"; 
import { Program, AnchorProvider, setProvider, BN } from "@coral-xyz/anchor"; 
import { Connection, Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"; 

const IDL = require("../../target/idl/gazibo.json"); 

const CLUSTER_URL = "http://127.0.0.1:8899"; 
const COMMITMENT = "confirmed" as const; 

function deriveClientProfilePDA(clientPubkey: any, programId: any): any { 
  const [pda] = PublicKey.findProgramAddressSync( 
    [
      Buffer.from("client_profile"), 
      clientPubkey.toBuffer(), 
    ],
    programId 
  );
  return pda; 
}

function deriveJobPDA(clientPubkey: any, jobId: number, programId: any): any { 
  const [pda] = PublicKey.findProgramAddressSync( 
    [
      Buffer.from("job"), 
      clientPubkey.toBuffer(), 
      Buffer.from(new BN(jobId).toArrayLike(Buffer, "le", 8)), 
    ],
    programId 
  );
  return pda; 
}

async function main() { 
  const connection = new Connection(CLUSTER_URL, COMMITMENT); 

  const client = Keypair.generate(); 
  const freelancer = Keypair.generate(); 

  console.log("Client:    ", client.publicKey.toBase58()); 
  console.log("Freelancer:", freelancer.publicKey.toBase58()); 

  console.log("\nAirdropping SOL..."); 
  await connection.requestAirdrop(client.publicKey, 10 * LAMPORTS_PER_SOL); 
  await connection.requestAirdrop(freelancer.publicKey, 1 * LAMPORTS_PER_SOL); 
  
  await new Promise((r) => setTimeout(r, 1000)); 

  const clientWallet = new anchor.Wallet(client); 
  const provider = new AnchorProvider(connection, clientWallet, { commitment: COMMITMENT }); 
  setProvider(provider); 

  const programId = new PublicKey(IDL.address); 
  const program: any = new Program(IDL, provider); 

  console.log("Program ID:", programId.toBase58()); 

  console.log("\n[0] Initializing Client Profile..."); 
  const clientProfilePDA = deriveClientProfilePDA(client.publicKey, programId); 

  const initTx = await program.methods 
    .initializeClient() 
    .accounts({ 
      client: client.publicKey, 
      clientProfile: clientProfilePDA, 
      systemProgram: SystemProgram.programId, 
    })
    .signers([client]) 
    .rpc(); 
  console.log("    TX:", initTx); 
  
  const jobId = 0; 
  const jobPDA = deriveJobPDA(client.publicKey, jobId, programId); 
  const jobAmount = new BN(2 * LAMPORTS_PER_SOL); 

  console.log("\n[1] Creating job..."); 
  console.log("    Job PDA:", jobPDA.toBase58()); 
  console.log("    Amount: ", jobAmount.toString(), "lamports"); 

  const createTx = await program.methods 
    .createJob( 
      "Build a Solana dApp", 
      "Build escrow on Anchor", 
      jobAmount, 
      new BN(jobId) 
    )
    .accounts({ 
      clientProfile: clientProfilePDA, 
      jobAccount: jobPDA, 
      client: client.publicKey, 
      systemProgram: SystemProgram.programId, 
    })
    .signers([client]) 
    .rpc(); 

  console.log("    TX:", createTx); 

  const jobData = await program.account.jobAccount.fetch(jobPDA); 
  console.log("    Status:", Object.keys(jobData.status)[0]); 
  console.log("    Job ID:", jobData.jobId.toString()); 

  console.log("\n[2] Freelancer accepting job..."); 

  const acceptTx = await program.methods 
    .acceptJob() 
    .accounts({ 
      freelancer: freelancer.publicKey, 
      jobAccount: jobPDA, 
    })
    .signers([freelancer]) 
    .rpc(); 

  console.log("    TX:", acceptTx); 
  const afterAccept = await program.account.jobAccount.fetch(jobPDA); 
  console.log("    Status:", Object.keys(afterAccept.status)[0]); 

  console.log("\n[3] Freelancer delivering job..."); 

  const deliverTx = await program.methods 
    .deliverJob() 
    .accounts({ 
      freelancer: freelancer.publicKey, 
      jobAccount: jobPDA, 
    })
    .signers([freelancer]) 
    .rpc(); 

  console.log("    TX:", deliverTx); 
  const afterDeliver = await program.account.jobAccount.fetch(jobPDA); 
  console.log("    Status:", Object.keys(afterDeliver.status)[0]); 

  console.log("\n[4] Client releasing payment..."); 

  const preBal = await connection.getBalance(freelancer.publicKey); 

  const releaseTx = await program.methods 
    .releasePayment() 
    .accounts({ 
      jobAccount: jobPDA, 
      client: client.publicKey, 
      freelancer: freelancer.publicKey, 
    })
    .signers([client]) 
    .rpc(); 

  console.log("    TX:", releaseTx); 

  try { 
    await program.account.jobAccount.fetch(jobPDA); 
    console.error("ERROR: account should be closed!"); 
  } catch { 
    console.log("✅ job_account closed (expected)"); 
  }

  const postBal = await connection.getBalance(freelancer.publicKey); 
  const received = postBal - preBal; 
  console.log("    Freelancer received:", received / LAMPORTS_PER_SOL, "SOL"); 
  console.log("\n✅ Full flow complete!"); 
}

main().catch((err) => { 
  console.error(err); 
  process.exit(1); 
});