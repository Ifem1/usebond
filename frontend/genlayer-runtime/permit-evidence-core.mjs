function address(value) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function callData(raw) {
  const decoded = raw?.txDataDecoded?.callData ?? raw?.data?.callData ?? raw?.callData;
  if (!decoded || typeof decoded !== "object") return null;
  const method = String(decoded.method ?? decoded.functionName ?? "");
  return method && Array.isArray(decoded.args) ? { method, args: decoded.args } : null;
}

export function recoverPermitFromIssuance(raw, permitKey, engineAddress, permitBookAddress, succeeded, expectedIntent) {
  if (!raw || typeof raw !== "object" || !succeeded) return null;
  const tx = raw;
  const status = String(tx.statusName ?? tx.status ?? "").toUpperCase();
  if (status !== "FINALIZED" && status !== "7") return null;

  const sender = address(tx.sender ?? tx.from ?? tx.from_address ?? tx.sender_address);
  const recipient = address(tx.recipient ?? tx.to ?? tx.to_address ?? tx.recipient_address);
  if (sender !== engineAddress.toLowerCase() || recipient !== permitBookAddress.toLowerCase()) return null;

  const decoded = callData(tx);
  if (!decoded || decoded.method !== "issue_permit" || decoded.args.length < 5) return null;
  const [issuedKey, intentKey, licenceKey, holder, decisionValue] = decoded.args;
  if (String(issuedKey) !== permitKey || typeof decisionValue !== "string") return null;

  let decision;
  try {
    decision = JSON.parse(decisionValue);
  } catch {
    return null;
  }
  if (!decision || !["PERMITTED", "PERMITTED_WITH_CONDITIONS"].includes(decision.outcome)) return null;
  if (!Array.isArray(decision.conditions) || !Array.isArray(decision.material_clauses)) return null;

  const permit = {
    permit_key: String(issuedKey),
    intent_key: String(intentKey),
    licence_key: String(licenceKey),
    holder: String(holder),
    outcome: decision.outcome,
    conditions: decision.conditions.map(String),
    summary: String(decision.summary ?? ""),
    material_clauses: decision.material_clauses,
    terms_digest: String(decision.terms_digest ?? ""),
    intent_digest: String(decision.intent_digest ?? ""),
    issuer: engineAddress,
    finalized_only: true,
  };

  if (expectedIntent) {
    const sameAddress = address(expectedIntent.holder) === address(permit.holder);
    const expectedOutcome = expectedIntent.assessment_outcome;
    if (
      expectedIntent.permit_key !== permit.permit_key ||
      expectedIntent.intent_key !== permit.intent_key ||
      expectedIntent.licence_key !== permit.licence_key ||
      !sameAddress ||
      expectedIntent.terms_digest !== permit.terms_digest ||
      expectedIntent.intent_digest !== permit.intent_digest ||
      !expectedOutcome?.startsWith("PERMITTED") ||
      expectedOutcome !== permit.outcome
    ) return null;
  }

  return permit;
}
