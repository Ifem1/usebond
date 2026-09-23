export type RightsMap = Record<string, string>;

export type LicenceRecord = {
  licence_key: string;
  title: string;
  asset_type: string;
  canonical_source: string;
  rights_holder: string;
  terms_text: string;
  rights_map: RightsMap;
  terms_digest: string;
  registrant: string;
  registered_at: string;
  frozen: boolean;
};

export type IntentFacts = {
  action: string;
  purpose: string;
  distribution: string;
  territory: string;
  attribution: string;
  source_redistribution: boolean;
  third_party_access: boolean;
  extra_facts: string;
};

export type MaterialClause = {
  clause: string;
  effect: string;
  reason: string;
};

export type PermissionOutcome =
  | "PERMITTED"
  | "PERMITTED_WITH_CONDITIONS"
  | "DENIED"
  | "INCONCLUSIVE";

export type Assessment = {
  outcome: PermissionOutcome;
  summary: string;
  material_clauses: MaterialClause[];
  conditions: string[];
  terms_digest?: string;
  intent_digest?: string;
};

export type IntentRecord = {
  intent_key: string;
  licence_key: string;
  terms_digest: string;
  holder: string;
  facts: IntentFacts;
  intent_statement: string;
  intent_digest: string;
  created_at: string;
  status: string;
  assessment_json: string;
  assessment_outcome?: PermissionOutcome;
  assessed_at?: string;
  permit_key: string;
  evaluation_count: number;
};

export type PermitRecord = {
  permit_key: string;
  intent_key: string;
  licence_key: string;
  holder: string;
  outcome: "PERMITTED" | "PERMITTED_WITH_CONDITIONS";
  conditions: string[];
  summary: string;
  material_clauses: MaterialClause[];
  terms_digest: string;
  intent_digest: string;
  issued_at: string;
  issuer: string;
  finalized_only: boolean;
};

export function parseJson<T>(raw: unknown): T | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
