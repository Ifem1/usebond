import { Suspense } from "react";
import { PermitPassport } from "@/permit-book/PermitPassport";

export default async function PermitPage({ params }: { params: Promise<{ permitKey: string }> }) {
  const { permitKey } = await params;
  return <Suspense fallback={<div className="shell"><div className="empty-ledger">Verifying permission credential…</div></div>}><PermitPassport permitKey={decodeURIComponent(permitKey)} /></Suspense>;
}
