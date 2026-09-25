import { ADDRESSES } from "./config";
import { transactionExecutionOutcome } from "./execution-outcome";
import type { IntentRecord, PermitRecord } from "./models";
import { recoverPermitFromIssuance } from "./permit-evidence-core.mjs";

/**
 * Recover a permit record only from a finalized, successful issue_permit call
 * made by the configured engine to the configured PermitBook. When the intent
 * is available, bind every permit field back to its finalized contract record.
 */
export function permitFromFinalizedIssuance(
  raw: unknown,
  permitKey: string,
  expectedIntent?: IntentRecord | null,
): PermitRecord | null {
  return recoverPermitFromIssuance(
    raw,
    permitKey,
    ADDRESSES.engine,
    ADDRESSES.permitBook,
    transactionExecutionOutcome(raw) === "SUCCESS",
    expectedIntent,
  );
}
