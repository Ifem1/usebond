import { Suspense } from "react";
import { RegistrySurface } from "@/rights-desk/catalogue/RegistrySurface";

export default function RegistryPage() {
  return <Suspense fallback={<div className="shell"><div className="empty-ledger">Opening rights registry…</div></div>}><RegistrySurface /></Suspense>;
}
