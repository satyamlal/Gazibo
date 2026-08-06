import { Connection, PublicKey } from "@solana/web3.js";
import IDL from "@/idl/gazibo.json";

const PROGRAM_ID      = new PublicKey(IDL.address);
const CLIENT_SEED     = Buffer.from("client_profile");
const FREELANCER_SEED = Buffer.from("freelancer_profile");

export type ProfileState = "client" | "freelancer" | "both" | "none";

export function deriveProfilePDAs(walletPubkey: PublicKey): {
    clientPda: PublicKey;
    freelancerPda: PublicKey;
} {
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

export async function fetchProfileState(
    connection: Connection,
    walletPubkey: PublicKey,
    maxAttempts = 3
): Promise<ProfileState> {
    const { clientPda, freelancerPda } = deriveProfilePDAs(walletPubkey);

    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const accounts = await connection.getMultipleAccountsInfo(
                [clientPda, freelancerPda],
                "confirmed"
            );
            const [ci, fi] = accounts;

            if (ci && fi) return "both";
            if (ci) return "client";
            if (fi) return "freelancer";
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