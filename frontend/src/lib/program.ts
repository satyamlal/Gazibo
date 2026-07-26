import { AnchorProvider, Program } from "@coral-xyz/anchor";
import type { Idl, BN } from "@coral-xyz/anchor";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import IDL from "@/idl/gazibo.json";

export const PROGRAM_ID = new PublicKey(IDL.address);
export const RPC_URL = "http://127.0.0.1:8899";

// PDA seeds — must match Rust constants exactly
export const CLIENT_PROFILE_SEED = Buffer.from("client_profile");
export const FREELANCER_PROFILE_SEED = Buffer.from("freelancer_profile");
export const GIG_SEED = Buffer.from("gig");
export const JOB_SEED = Buffer.from("job");

// On-chain account types
// Anchor converts Rust snake_case → TypeScript camelCase automatically
export interface ClientProfileAccount {
    client: PublicKey;
    jobCounter: BN;
    totalSpent: BN;
    activeJobs: number;
    bump: number;
}

export interface FreelancerProfileAccount {
    freelancer: PublicKey;
    gigCounter: BN;
    jobsCompleted: BN;
    totalEarned: BN;
    ratingSum: number;
    ratingCount: number;
    bump: number;
}

export interface GigOnChain {
    freelancer: PublicKey;
    gigId: BN;
    title: string;
    basicPrice: BN;
    standardPrice: BN;
    premiumPrice: BN;
    isActive: boolean;
    createdAt: BN;
    metadataUri: string;
    bump: number;
}

export interface JobOnChain {
    client: PublicKey;
    freelancer: PublicKey | null;
    amount: BN;
    status: Record<string, Record<string, never>>;
    title: string;
    description: string;
    jobId: BN;
    createdAt: BN;
    bump: number;
}

// Read-only wallet for pages that don't require sign-in
const READONLY_WALLET: AnchorWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => { throw new Error("Read-only"); },
    signAllTransactions: async () => { throw new Error("Read-only"); },
};

// Typed program interface so every page gets full autocomplete
export interface GaziboProgram {
    methods: {
        initializeClient(): { rpc(): Promise<string> };
        initializeFreelancer(): { rpc(): Promise<string> };
        createGig(
            gigId: BN,
            title: string,
            basicPrice: BN,
            standardPrice: BN,
            premiumPrice: BN,
            metadataUri: string,
    ): { accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> } };
    createJob(
        title: string,
        description: string,
        amount: BN,
        jobId: BN,
    ): { accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> } };
            acceptJob(): { accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> } };
            deliverJob(): { accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> } };
            releasePayment(): { accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> } };
            cancelJob(): { accounts(a: Record<string, PublicKey>): { rpc(): Promise<string> } };
    };
    account: {
        clientProfile: {
            all(): Promise<{ publicKey: PublicKey; account: ClientProfileAccount }[]>;
            fetch(addr: PublicKey): Promise<ClientProfileAccount>;
        };
        freelancerProfile: {
            all(): Promise<{ publicKey: PublicKey; account: FreelancerProfileAccount }[]>;
            fetch(addr: PublicKey): Promise<FreelancerProfileAccount>;
        };
        gigAccount: {
            all(): Promise<{ publicKey: PublicKey; account: GigOnChain }[]>;
            fetch(addr: PublicKey): Promise<GigOnChain>;
        };
        jobAccount: {
            all(): Promise<{ publicKey: PublicKey; account: JobOnChain }[]>;
            fetch(addr: PublicKey): Promise<JobOnChain>;
        };
    };
}

// Pass a wallet to get a signing program, omit it for read-only browsing
export function buildProgram(
    connection: Connection,
    wallet?: AnchorWallet,
): GaziboProgram {
    const provider = new AnchorProvider(
        connection,
        wallet ?? READONLY_WALLET,
        { commitment: "confirmed" },
    );
    return new Program(IDL as unknown as Idl, provider) as unknown as GaziboProgram;
}

// PDA derivation helpers
export function clientProfilePda(walletPubkey: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
        [CLIENT_PROFILE_SEED, walletPubkey.toBuffer()],
        PROGRAM_ID,
    )[0];
}

export function freelancerProfilePda(walletPubkey: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
        [FREELANCER_PROFILE_SEED, walletPubkey.toBuffer()],
        PROGRAM_ID,
    )[0];
}

export function gigAccountPda(freelancerPubkey: PublicKey, gigId: bigint): PublicKey {
    const idBytes = Buffer.alloc(8);
    idBytes.writeBigUInt64LE(gigId);
    return PublicKey.findProgramAddressSync(
        [GIG_SEED, freelancerPubkey.toBuffer(), idBytes],
        PROGRAM_ID,
    )[0];
}

// Display utilities used across pages
export function shortAddress(pubkey: PublicKey): string {
    const s = pubkey.toBase58();
    return `${s.slice(0, 4)}…${s.slice(-4)}`;
}

export function lamportsToSol(lamports: BN | number): string {
    const n = typeof lamports === "number" ? lamports : lamports.toNumber();
    return (n / 1_000_000_000).toFixed(3);
}

export function ratingAvg(sum: number, count: number): number {
    return count === 0 ? 0 : sum / count;
}