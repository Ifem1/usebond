import { Suspense } from "react";
import { PermissionLens } from "@/permission-lens/PermissionLens";

export default async function IntentPage({ params }: { params: Promise<{ intentKey: string }> }) {
  const { intentKey } = await params;
  return <Suspense fallback={<div className="shell"><div className="empty-ledger">Opening Permission Lens…</div></div>}><PermissionLens intentKey={decodeURIComponent(intentKey)} /></Suspense>;
}
