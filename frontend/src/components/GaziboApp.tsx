"use client";

import { useState, useEffect, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import type { AnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import type { Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import IDL from "@/idl/gazibo.json";

interface ClientProfile {
  client: PublicKey;
  jobCounter: BN;
  totalSpent: BN;
  activeJobs: number;
  bump: number;
}

interface JobAccount {
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

// Anchor method chain return type — matches runtime API
interface TxBuilder {
  accounts(accs: Record<string, PublicKey>): TxBuilder;
  rpc(): Promise<string>;
}

interface GaziboProgram {
  methods: {
    initializeClient(): TxBuilder;
    createJob(title: string, desc: string, amount: BN, jobId: BN): TxBuilder;
    acceptJob(): TxBuilder;
    deliverJob(): TxBuilder;
    releasePayment():TxBuilder;
    cancelJob(): TxBuilder;
  };
  account: {
    clientProfile: { fetch(pda: PublicKey): Promise<ClientProfile> };
    jobAccount: { fetch(pda: PublicKey): Promise<JobAccount>    };
  };
}

const PROGRAM_ID = new PublicKey(IDL.address);

// ── PDA Derivation ────────────────────────────────────────────────
function deriveProfilePDA(wallet: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("client_profile"), wallet.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

function deriveJobPDA(client: PublicKey, jobId: number): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("job"),
      client.toBuffer(),
      // BN → little-endian 8 bytes = Rust's u64::to_le_bytes()
      Buffer.from(new BN(jobId).toArrayLike(Buffer, "le", 8)),
    ],
    PROGRAM_ID
  );
  return pda;
}

// ── Status helpers ────────────────────────────────────────────────
function getStatusKey(status: Record<string, Record<string, never>>): string {
  return Object.keys(status)[0] ?? "";
}
function getStatusLabel(key: string): string {
  const map: Record<string, string> = {
    open:       "OPEN",
    inProgress: "IN PROGRESS",
    delivered:  "DELIVERED",
    completed:  "COMPLETED",
    cancelled:  "CANCELLED",
  };
  return map[key] ?? key.toUpperCase();
}

// ── Sub-components ────────────────────────────────────────────────
function StatusBadge({ status }: { status: Record<string, Record<string, never>> }) {
  const key = getStatusKey(status);
  const colors: Record<string, string> = {
    open:       "bg-emerald-900/60 text-emerald-300 border-emerald-700",
    inProgress: "bg-blue-900/60    text-blue-300    border-blue-700",
    delivered:  "bg-amber-900/60   text-amber-300   border-amber-700",
    completed:  "bg-purple-900/60  text-purple-300  border-purple-700",
    cancelled:  "bg-red-900/60     text-red-300     border-red-700",
  };
  return (
    <span className={`border text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${colors[key] ?? "bg-slate-700 text-slate-300 border-slate-500"}`}>
      {getStatusLabel(key)}
    </span>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-800/70 rounded-xl p-4 text-center">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ActionBtn({
  onClick, disabled, color, label, sublabel,
}: {
  onClick: () => void;
  disabled: boolean;
  color: "teal" | "red" | "blue" | "emerald";
  label: string;
  sublabel: string;
}) {
  const bg: Record<string, string> = {
    teal:    "bg-teal-700    hover:bg-teal-600",
    red:     "bg-red-800     hover:bg-red-700",
    blue:    "bg-blue-700    hover:bg-blue-600",
    emerald: "bg-emerald-700 hover:bg-emerald-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${bg[color]} disabled:opacity-40 text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors text-left w-full`}
    >
      <div>{label}</div>
      <div className="text-xs opacity-70 mt-0.5">{sublabel}</div>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────
export function GaziboApp() {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const program = useMemo((): GaziboProgram | null => {
    const { publicKey, signTransaction, signAllTransactions } = wallet;
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const anchorWallet: AnchorWallet = { publicKey, signTransaction, signAllTransactions };
    const provider = new AnchorProvider(connection, anchorWallet, { commitment: "confirmed" });

    return new Program(IDL as unknown as Idl, provider) as unknown as GaziboProgram;
  }, [wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions, connection]);

  // UI state
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [job, setJob] = useState<JobAccount | null>(null);
  const [jobPDA, setJobPDA] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [amountSol, setAmountSol] = useState("0.01");

  useEffect(() => {
    if (!program || !wallet.publicKey) return;

    let cancelled = false;
    void (async () => {
      try {
        const pda  = deriveProfilePDA(wallet.publicKey!);
        const data = await program.account.clientProfile.fetch(pda);
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) setProfile(null);
      }
    })();

    return () => { cancelled = true; };
  }, [program, wallet.publicKey]);

  const refreshProfile = async (): Promise<void> => {
    if (!program || !wallet.publicKey) return;
    try {
      const pda  = deriveProfilePDA(wallet.publicKey);
      const data = await program.account.clientProfile.fetch(pda);
      setProfile(data);
    } catch {
      setProfile(null);
    }
  };

  const fetchJob = async (pdaStr: string): Promise<void> => {
    if (!program || !pdaStr) return;
    try {
      const pda  = new PublicKey(pdaStr);
      const data = await program.account.jobAccount.fetch(pda);
      setJob(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Could not fetch job: ${msg}`);
      setJob(null);
    }
  };

  const run = async (label: string, fn: () => Promise<void>): Promise<void> => {
    setLoading(label);
    setError("");
    setTxHash("");
    try {
      await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.length > 200 ? `${msg.slice(0, 200)}...` : msg);
    } finally {
      setLoading("");
    }
  };

  // ── Event Handlers ────────────────────────────────────────────────
  const handleInitProfile = (): void => {
    void run("Initializing profile...", async () => {
      if (!program || !wallet.publicKey) return;
      const profilePDA = deriveProfilePDA(wallet.publicKey);
      const tx = await program.methods
        .initializeClient()
        .accounts({ client: wallet.publicKey, clientProfile: profilePDA, systemProgram: SystemProgram.programId })
        .rpc();
      setTxHash(tx);
      await refreshProfile();
    });
  };

  const handleCreateJob = (): void => {
    void run("Posting job...", async () => {
      if (!program || !wallet.publicKey || !profile) return;
      const profilePDA = deriveProfilePDA(wallet.publicKey);
      const jobId      = profile.jobCounter.toNumber();
      const newJobPDA  = deriveJobPDA(wallet.publicKey, jobId);
      const lamports   = new BN(Math.round(parseFloat(amountSol) * LAMPORTS_PER_SOL));

      const tx = await program.methods
        .createJob(title, description, lamports, new BN(jobId))
        .accounts({ clientProfile: profilePDA, jobAccount: newJobPDA, client: wallet.publicKey, systemProgram: SystemProgram.programId })
        .rpc();

      setTxHash(tx);
      setJobPDA(newJobPDA.toBase58());
      setTitle("");
      setDesc("");
      await refreshProfile();
      await fetchJob(newJobPDA.toBase58());
    });
  };

  const handleAcceptJob = (): void => {
    void run("Accepting job...", async () => {
      if (!program || !wallet.publicKey || !jobPDA) return;
      const pda = new PublicKey(jobPDA);
      const tx  = await program.methods
        .acceptJob()
        .accounts({ freelancer: wallet.publicKey, jobAccount: pda })
        .rpc();
      setTxHash(tx);
      await fetchJob(jobPDA);
    });
  };

  const handleDeliverJob = (): void => {
    void run("Submitting delivery...", async () => {
      if (!program || !wallet.publicKey || !jobPDA) return;
      const pda = new PublicKey(jobPDA);
      const tx  = await program.methods
        .deliverJob()
        .accounts({ freelancer: wallet.publicKey, jobAccount: pda })
        .rpc();
      setTxHash(tx);
      await fetchJob(jobPDA);
    });
  };

  const handleReleasePayment = (): void => {
    void run("Releasing payment...", async () => {
      if (!program || !wallet.publicKey || !jobPDA || !job?.freelancer) return;
      const pda = new PublicKey(jobPDA);
      const tx  = await program.methods
        .releasePayment()
        .accounts({ jobAccount: pda, client: wallet.publicKey, freelancer: job.freelancer })
        .rpc();
      setTxHash(tx);
      setJob(null);
      await refreshProfile();
    });
  };

  const handleCancelJob = (): void => {
    void run("Cancelling job...", async () => {
      if (!program || !wallet.publicKey || !jobPDA) return;
      const pda = new PublicKey(jobPDA);
      const tx  = await program.methods
        .cancelJob()
        .accounts({ client: wallet.publicKey, jobAccount: pda })
        .rpc();
      setTxHash(tx);
      setJob(null);
    });
  };

  // ── Derived UI values ─────────────────────────────────────────────
  const statusKey   = job ? getStatusKey(job.status) : null;
  const isClient    = job && wallet.publicKey && job.client.toBase58()     === wallet.publicKey.toBase58();
  const isFreelancer= job && wallet.publicKey && job.freelancer?.toBase58()=== wallet.publicKey.toBase58();

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "monospace" }}>

      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔷</span>
          <div>
            <span className="text-xl font-bold text-white">Gazibo</span>
            <span className="text-xs text-slate-500 ml-3">Freelance Escrow · Solana Localnet</span>
          </div>
        </div>
        <WalletMultiButton />
      </header>

      {!wallet.connected ? (
        /* Not connected */
        <div className="flex flex-col items-center justify-center py-40 gap-6 text-center px-4">
          <span className="text-6xl">👻</span>
          <h1 className="text-3xl font-bold text-white">Connect your wallet</h1>
          <p className="text-slate-400 max-w-md">
            Open Phantom → Network → <strong className="text-purple-400">Localhost</strong> to interact with the local validator.
          </p>
          <p className="text-slate-500 text-sm">
            Make sure <code className="bg-slate-800 px-2 py-0.5 rounded text-teal-400">solana-test-validator</code> is running on port 8899
          </p>
          <WalletMultiButton />
        </div>
      ) : (
        <main className="max-w-3xl mx-auto px-6 py-8 space-y-5">

          {/* Notifications */}
          {loading && (
            <div className="bg-yellow-950 border border-yellow-700 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">⏳</span>
              <span className="text-yellow-200 text-sm">{loading}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-950 border border-red-700 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm font-bold mb-1">❌ Error</p>
              <p className="text-red-300 text-xs break-all">{error}</p>
            </div>
          )}
          {txHash && !loading && (
            <div className="bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3">
              <p className="text-emerald-400 text-sm font-bold mb-1">✅ Transaction confirmed</p>
              <p className="text-emerald-300 text-xs break-all">{txHash}</p>
            </div>
          )}

          {/* Profile */}
          <section className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">📋 My Client Profile</h2>
            {profile ? (
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Jobs Posted"  value={profile.jobCounter.toNumber().toString()} color="text-white" />
                <Stat label="Total Spent"  value={`${(profile.totalSpent.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL`} color="text-teal-400" />
                <Stat label="Active Jobs"  value={profile.activeJobs.toString()} color="text-orange-400" />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-slate-300 text-sm font-medium">No profile found</p>
                  <p className="text-slate-500 text-xs mt-0.5">Initialize once to start posting jobs.</p>
                </div>
                <button
                  onClick={handleInitProfile}
                  disabled={!!loading}
                  className="shrink-0 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Initialize Profile
                </button>
              </div>
            )}
          </section>

          {/* Post a Job */}
          {profile && (
            <section className="bg-slate-900 border border-slate-700 rounded-xl p-6">
              <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">💼 Post a Job</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Title <span className="text-slate-600">(max 50 chars)</span></label>
                  <input value={title} onChange={e => setTitle(e.target.value)} maxLength={50}
                    placeholder="Build a Solana dApp..."
                    className="w-full bg-slate-800 border border-slate-600 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Description <span className="text-slate-600">(max 500 chars)</span></label>
                  <textarea value={description} onChange={e => setDesc(e.target.value)} maxLength={500} rows={3}
                    placeholder="Describe the job requirements..."
                    className="w-full bg-slate-800 border border-slate-600 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Amount <span className="text-slate-600">(SOL, min 0.001)</span></label>
                  <input value={amountSol} onChange={e => setAmountSol(e.target.value)}
                    type="number" min="0.001" step="0.001"
                    className="w-full bg-slate-800 border border-slate-600 focus:border-purple-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors"
                  />
                </div>
                <button onClick={handleCreateJob} disabled={!!loading || !title.trim() || !description.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                >
                  Post Job ({amountSol} SOL locked in escrow)
                </button>
              </div>
            </section>
          )}

          {/* Job Actions */}
          <section className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">🎯 Job Actions</h2>
            <div className="flex gap-2 mb-4">
              <input value={jobPDA} onChange={e => setJobPDA(e.target.value)}
                placeholder="Job PDA address (auto-fills after posting)"
                className="flex-1 bg-slate-800 border border-slate-600 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              <button onClick={() => void fetchJob(jobPDA)} disabled={!!loading || !jobPDA}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                Fetch
              </button>
            </div>

            {job && (
              <div className="space-y-4">
                <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Title</span>
                    <span className="text-white font-semibold">{job.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Escrowed</span>
                    <span className="text-teal-400 font-bold">
                      {(job.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Job ID</span>
                    <span className="text-slate-300">#{job.jobId.toNumber()}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Client</span>
                    <span className="text-slate-300 text-xs text-right break-all">
                      {job.client.toBase58()}
                      {isClient && <span className="text-purple-400 ml-1">(you)</span>}
                    </span>
                  </div>
                  {job.freelancer && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-400 shrink-0">Freelancer</span>
                      <span className="text-slate-300 text-xs text-right break-all">
                        {job.freelancer.toBase58()}
                        {isFreelancer && <span className="text-teal-400 ml-1">(you)</span>}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-slate-400 text-xs">{job.description}</p>
                  </div>
                </div>

                {/* Contextual action buttons */}
                <div className="space-y-2">
                  {statusKey === "open" && (
                    <div className="grid grid-cols-2 gap-2">
                      <ActionBtn onClick={handleAcceptJob}  disabled={!!loading} color="teal"    label="✅ Accept Job"       sublabel="You become the freelancer" />
                      <ActionBtn onClick={handleCancelJob}  disabled={!!loading} color="red"     label="❌ Cancel Job"       sublabel="Refunds escrow to client"  />
                    </div>
                  )}
                  {statusKey === "inProgress" && (
                    <ActionBtn onClick={handleDeliverJob}   disabled={!!loading} color="blue"    label="📦 Mark as Delivered" sublabel="As the assigned freelancer" />
                  )}
                  {statusKey === "delivered" && (
                    <ActionBtn onClick={handleReleasePayment} disabled={!!loading} color="emerald" label="💸 Release Payment"  sublabel="Approves work — pays freelancer" />
                  )}
                  {(statusKey === "completed" || statusKey === "cancelled") && (
                    <p className="text-center text-slate-500 text-sm py-3">
                      This job is <span className="text-slate-300">{statusKey}</span>. No further actions.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* State machine reference */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">State Machine</h2>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              {["OPEN","→","IN PROGRESS","→","DELIVERED","→","COMPLETED"].map((s, i) => (
                <span key={i} className={s === "→" ? "text-slate-600" : "bg-slate-800 text-slate-300 px-2 py-1 rounded"}>{s}</span>
              ))}
              <span className="text-slate-600 mx-1">|</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">OPEN</span>
              <span className="text-slate-600">→</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded">CANCELLED</span>
            </div>
          </section>

        </main>
      )}
    </div>
  );
}