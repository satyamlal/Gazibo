import { InfoPageLayout, InfoSection, InfoCallout } from "@/components/info/InfoPageLayout";
import { Scale } from "lucide-react";

export default function DisputeResolutionPage() {
  return (
    <InfoPageLayout eyebrow="Protocol" title="Dispute Resolution"
      description="What the program actually does when a job doesn't go to plan — and what it doesn't do yet." icon={Scale}>
      <InfoSection title="Before a freelancer accepts">
        <p>A client can cancel a job and get a full refund at any point <strong>while it&apos;s still Open</strong>. The <code className="text-[#85DABE] text-xs">cancel_job</code> instruction closes the escrow account and returns the rent and the locked SOL to the client in one transaction.</p>
      </InfoSection>
      <InfoSection title="After a freelancer accepts">
        <p>This is the part worth being direct about: <strong>once a job moves to In Progress, there is currently no on-chain arbitration instruction.</strong> If a freelancer accepts a job and never delivers, the client&apos;s funds stay locked — the contract has no timeout and no third party who can force a refund or release.</p>
        <p>This isn&apos;t an oversight I&apos;m glossing over — it&apos;s the actual current behavior of the deployed instructions.</p>
      </InfoSection>
      <InfoCallout tone="warning">
        <strong>Current version:</strong> resolution depends on the freelancer actually calling <code className="text-xs">deliver_job</code>. There is no dispute, arbitrator, or timeout-based refund path yet. Don&apos;t lock funds into a job with a counterparty you don&apos;t trust.
      </InfoCallout>
      <InfoSection title="What's planned">
        <p>A future version could add a timeout — if a freelancer accepts and doesn&apos;t deliver within a window, the client regains the ability to cancel. Neither exists in the contract today.</p>
      </InfoSection>
    </InfoPageLayout>
  );
}