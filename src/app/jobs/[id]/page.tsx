import Link from "next/link";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { db } from "@/lib/db";
import TestnetPayment from "./TestnetPayment";

export const dynamic = "force-dynamic";

type Job = {
  id: string;
  agent_slug: string;
  owner_address: string | null;
  token_id: string | null;
  state: string;
  payment_state: string;
  created_at: string;
  metadata: { paymentAuthorization?: { status?: string }; execution?: { status?: string; strategy?: string; width?: string; tickHalfWidth?: number; currentTick?: number; lowerTick?: number; upperTick?: number; pool?: string } };
};

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await db.query("SELECT id, agent_slug, owner_address, token_id, state, payment_state, created_at, metadata FROM jobs WHERE id=$1", [id]);
  const job = result.rows[0] as Job | undefined;
  const states = ["Request", "Test", "Hire", "Execution", "Result", "Payment"];

  return (
    <main className="market-shell workspace-page">
      <WorkspaceNav section={`Job / ${id}`} />
      <div className="workspace-body">
        <Link href="/marketplace" className="workspace-back">← Return to marketplace</Link>
        <header className="workspace-header">
          <p className="workspace-kicker">Execution record</p>
          <h1>{job ? <>Job<br />{job.state}.</> : <>Job<br />not found.</>}</h1>
          <p className="workspace-lede">{job ? "This durable job record exists, but no test, hire, payment, or transaction has been started." : "No durable job exists for this identifier."}</p>
        </header>
        {job ? <>
          <section className="job-timeline">{states.map((state, index) => <div key={state}><span>0{index + 1}</span><strong>{state}</strong><em>{state === "Request" ? "Recorded" : "Not recorded"}</em></div>)}</section>
          {job.metadata?.execution ? <section className="proposal-state"><span className="qualification-dot" /><div><strong>Proposed range · {job.metadata.execution.width}</strong><p>Current tick {job.metadata.execution.currentTick ?? "pending"} → {job.metadata.execution.lowerTick ?? "pending"} to {job.metadata.execution.upperTick ?? "pending"}. Pool {job.metadata.execution.pool ?? "pending live resolution"}.</p></div></section> : null}
          <dl className="qualification-facts"><div><dt>Agent</dt><dd>{job.agent_slug}</dd></div><div><dt>State</dt><dd>{job.state}</dd></div><div><dt>Payment</dt><dd>{job.payment_state}</dd></div><div><dt>Token</dt><dd>{job.token_id || "Not selected"}</dd></div></dl>
          {job.agent_slug === "pancake-position-keeper" && job.state === "draft" ? <form className="workspace-link-form" action={`/api/jobs/${id}/test`} method="post"><button className="workspace-link" type="submit">Request bounded read-only test ↗</button></form> : job.agent_slug === "pancake-position-keeper" && job.state === "test_requested" ? <form className="workspace-link-form" action={`/api/jobs/${id}/execute-test`} method="post"><button className="workspace-link" type="submit">Run read-only test ↗</button></form> : job.agent_slug === "pancake-position-keeper" && job.state === "test_completed" ? <form className="workspace-link-form" action={`/api/jobs/${id}/hire`} method="post"><button className="workspace-link" type="submit">Continue to hire review ↗</button></form> : job.agent_slug === "pancake-position-keeper" && job.state === "hire_pending" && job.metadata?.paymentAuthorization?.status === "requested" ? <TestnetPayment jobId={id} /> : job.agent_slug === "pancake-position-keeper" && job.state === "hire_pending" ? <form className="workspace-link-form" action={`/api/jobs/${id}/payment-review`} method="post"><button className="workspace-link" type="submit">Review payment terms ↗</button></form> : job.agent_slug === "pancake-position-keeper" && job.state === "hired" && job.metadata?.execution?.status === "ready_for_review" ? <form className="workspace-link-form" action={`/api/jobs/${id}/approve-execution`} method="post"><button className="workspace-link" type="submit">Approve position execution ↗</button></form> : job.agent_slug === "pancake-position-keeper" && job.state === "hired" ? <form className="workspace-link-form" action={`/api/jobs/${id}/execution-review`} method="post"><button className="workspace-link" type="submit">Review position execution ↗</button></form> : null}
        </> : <p className="workspace-empty">Bearing has not created a request, charged a payment, or submitted a transaction.</p>}
      </div>
    </main>
  );
}
