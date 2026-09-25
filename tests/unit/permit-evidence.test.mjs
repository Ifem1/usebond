import test from "node:test";
import assert from "node:assert/strict";
import { recoverPermitFromIssuance } from "../../frontend/genlayer-runtime/permit-evidence-core.mjs";

const engine = "0x88C1b897759E57dD3f24c42ed26248FaE6F610A7";
const permitBook = "0xA7Ca373c4eb0A9da8770B310C60C1e3CE61F9676";
const decision = {
  outcome: "PERMITTED_WITH_CONDITIONS",
  summary: "Use is permitted with attribution.",
  conditions: ["Credit the source."],
  material_clauses: [{ clause: "Attribution", effect: "condition", reason: "Required" }],
  terms_digest: "terms-digest",
  intent_digest: "intent-digest",
};
const expectedIntent = {
  intent_key: "UBI-TEST-01",
  licence_key: "UBL-TEST-01",
  permit_key: "UBP-UBI-TEST-01",
  holder: "0xE3A26A71b2B26aC623A1F1447D28afc6cac0Fb9c",
  terms_digest: "terms-digest",
  intent_digest: "intent-digest",
  assessment_outcome: "PERMITTED_WITH_CONDITIONS",
};
function tx(overrides = {}) {
  return {
    statusName: "FINALIZED",
    txExecutionResultName: "FINISHED_WITH_RETURN",
    sender: engine,
    recipient: permitBook,
    txDataDecoded: { callData: { method: "issue_permit", args: [
      expectedIntent.permit_key,
      expectedIntent.intent_key,
      expectedIntent.licence_key,
      expectedIntent.holder,
      JSON.stringify(decision),
    ] } },
    ...overrides,
  };
}

test("recovers a finalized conditional permit and preserves its conditions", () => {
  const permit = recoverPermitFromIssuance(tx(), expectedIntent.permit_key, engine, permitBook, true, expectedIntent);
  assert.equal(permit?.outcome, "PERMITTED_WITH_CONDITIONS");
  assert.deepEqual(permit?.conditions, ["Credit the source."]);
  assert.equal(permit?.intent_digest, expectedIntent.intent_digest);
  assert.equal(permit?.finalized_only, true);
});

test("rejects an issuance that is not finalized or did not execute successfully", () => {
  assert.equal(recoverPermitFromIssuance(tx({ statusName: "ACCEPTED" }), expectedIntent.permit_key, engine, permitBook, true), null);
  assert.equal(recoverPermitFromIssuance(tx(), expectedIntent.permit_key, engine, permitBook, false), null);
});

test("rejects a wrong issuer, destination, method, or permit key", () => {
  assert.equal(recoverPermitFromIssuance(tx({ sender: "0x0000000000000000000000000000000000000001" }), expectedIntent.permit_key, engine, permitBook, true), null);
  assert.equal(recoverPermitFromIssuance(tx({ recipient: engine }), expectedIntent.permit_key, engine, permitBook, true), null);
  assert.equal(recoverPermitFromIssuance(tx({ txDataDecoded: { callData: { method: "bind_engine", args: [] } } }), expectedIntent.permit_key, engine, permitBook, true), null);
  assert.equal(recoverPermitFromIssuance(tx(), "UBP-OTHER", engine, permitBook, true), null);
});

test("never recovers DENIED or INCONCLUSIVE outcomes", () => {
  for (const outcome of ["DENIED", "INCONCLUSIVE"]) {
    const deniedCall = tx({ txDataDecoded: { callData: { method: "issue_permit", args: [
      expectedIntent.permit_key, expectedIntent.intent_key, expectedIntent.licence_key,
      expectedIntent.holder, JSON.stringify({ ...decision, outcome }),
    ] } } });
    assert.equal(recoverPermitFromIssuance(deniedCall, expectedIntent.permit_key, engine, permitBook, true), null);
  }
});

test("binds recovered issuance to the stored intent and its digests", () => {
  assert.equal(recoverPermitFromIssuance(tx(), expectedIntent.permit_key, engine, permitBook, true, { ...expectedIntent, holder: "0x0000000000000000000000000000000000000001" }), null);
  assert.equal(recoverPermitFromIssuance(tx(), expectedIntent.permit_key, engine, permitBook, true, { ...expectedIntent, assessment_outcome: "DENIED" }), null);
});
