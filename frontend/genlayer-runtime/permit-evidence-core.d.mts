import type { IntentRecord, PermitRecord } from "./models";

export function recoverPermitFromIssuance(
  raw: unknown,
  permitKey: string,
  engineAddress: string,
  permitBookAddress: string,
  succeeded: boolean,
  expectedIntent?: IntentRecord | null,
): PermitRecord | null;
