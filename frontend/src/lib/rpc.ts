import { Connection, PublicKey } from "@solana/web3.js";
import IDL from "@/idl/gazibo.json";

const PROGRAM_ID = new PublicKey(IDL.address);
const CLIENT_SEED = Buffer.from("client_profile");
const FREELANCER_SEED = Buffer.from("freelancer_profile");
const ROLE_SEED = Buffer.from("role_registry");
const ROLE_ENUM_OFFSET = 40;

export type ProfileState = "client" | "freelancer" | "both" | "none";

export function deriveProfilePDAs(walletPubkey: PublicKey) {
    const [clientPda] = PublicKey.findProgramAddressSync(
        [CLIENT_SEED, walletPubkey.toBuffer()],
        PROGRAM_ID
    );

    const [freelancerPda] = PublicKey.findProgramAddressSync(
        [FREELANCER_SEED, walletPubkey.toBuffer()],
        PROGRAM_ID
    );
    
    return { clientPda, freelancerPda };
}

export function deriveRoleRegistryPDA(walletPubkey: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
        [ROLE_SEED, walletPubkey.toBuffer()],
        PROGRAM_ID
    );
    
    return pda;
}

export async function fetchProfileState(
    connection: Connection,
    walletPubkey: PublicKey,
    maxAttempts = 3
): Promise<ProfileState> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            // Primary: check role_registry (single account, authoritative)
            const registryPda = deriveRoleRegistryPDA(walletPubkey);
            const { clientPda, freelancerPda } = deriveProfilePDAs(walletPubkey);

            // Batch all three in one RPC call
            const [registryInfo, clientInfo, freelancerInfo] =
                await connection.getMultipleAccountsInfo(
                [registryPda, clientPda, freelancerPda],
                "confirmed"
                );

            // Path A: role_registry exists (new wallets post-upgrade)
            if (registryInfo !== null && registryInfo.data.length > ROLE_ENUM_OFFSET) {
                const roleEnum = registryInfo.data[ROLE_ENUM_OFFSET];
                return roleEnum === 0 ? "client" : "freelancer";
            }

            // Path B: legacy wallets (no role_registry, check both profiles)
            if (clientInfo && freelancerInfo) return "both";
            if (clientInfo) return "client";
            if (freelancerInfo) return "freelancer";
            return "none";

        } catch (err) {
            lastError = err;
            if (attempt < maxAttempts - 1) {
                await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
            }
        }
    }

    throw lastError;
}