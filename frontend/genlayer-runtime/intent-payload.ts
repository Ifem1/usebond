import type { IntentFacts } from "./models";

/** Keep frontend positional calldata aligned with PermissionEngine.create_intent. */
export function createIntentArguments(intentKey: string, licenceKey: string, facts: IntentFacts) {
  return [
    intentKey,
    licenceKey,
    facts.action,
    facts.purpose,
    facts.distribution,
    facts.territory,
    facts.attribution,
    facts.source_redistribution,
    facts.third_party_access,
    facts.extra_facts,
  ];
}
