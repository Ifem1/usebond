export type ExecutionOutcome = "SUCCESS" | "FAILED" | "UNKNOWN";

/** Normalize both current GenLayer receipt-shaped responses and older SDK fields. */
export function transactionExecutionOutcome(raw: unknown): ExecutionOutcome {
  if (!raw || typeof raw !== "object") return "UNKNOWN";
  const tx = raw as any;
  const legacy = String(tx.txExecutionResultName ?? "").toUpperCase();
  if (["FINISHED_WITH_RETURN", "SUCCESS", "RETURN"].includes(legacy)) return "SUCCESS";
  if (["FINISHED_WITH_ERROR", "FAILED", "ERROR"].includes(legacy)) return "FAILED";

  const receipts = tx.consensus_data?.leader_receipt;
  if (!Array.isArray(receipts) || receipts.length === 0) return "UNKNOWN";
  const leaders = receipts.filter((receipt: any) => receipt?.mode === "leader");
  const candidates = leaders.length ? leaders : receipts;
  const statuses = candidates.map((receipt: any) => String(receipt?.result?.status ?? "").toLowerCase());
  if (statuses.length && statuses.every((status: string) => status === "return")) return "SUCCESS";
  if (statuses.length && statuses.every((status: string) => ["rollback", "contract_error", "error"].includes(status))) return "FAILED";
  return "UNKNOWN";
}
