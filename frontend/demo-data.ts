import type { IntentFacts } from "@/genlayer-runtime/models";

const SAMPLE_RIGHTS_MAP: Record<string, string> = {
  commercial_use: "conditional",
  model_training: "conditional",
  derivative_works: "permitted",
  redistribution: "denied",
  attribution: "required",
};

export function createSampleLicence() {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase();
  return {
    key: `UBL-EUROSTAT-${suffix}`,
    title: "Population on 1 January by age, sex and type of projection (proj_23np)",
    assetType: "dataset",
    canonicalSource: "https://ec.europa.eu/eurostat/databrowser/view/proj_23np/default/bar?lang=en",
    rightsHolder: "European Commission — Eurostat",
    termsText: [
      "Illustrative test scenario only — this is not an official Eurostat licence or rights statement.",
      "For this scenario, statistical analysis and commercial model training using aggregate population projections are permitted when the source is acknowledged. Public distribution of aggregate derived projections is permitted if material changes are described.",
      "Do not redistribute the complete source extract or provide third parties access to source files under this scenario. Third-party material, logos, personal or confidential microdata, and dataset-specific exceptions are outside these sample terms.",
      "This scenario does not resolve whether the aggregate projections may be used to make individual decisions, such as insurance eligibility. That use is intentionally left unclear for testing.",
      "Before any real reuse, consult Eurostat’s current reuse notice and this dataset’s metadata; those official notices and any dataset-specific conditions control.",
      "Suggested attribution for this test: Source: Eurostat, dataset proj_23np. Describe any changes or processing.",
    ].join("\n\n"),
    rightsMap: { ...SAMPLE_RIGHTS_MAP },
  };
}

export const SAMPLE_INTENT_FACTS: IntentFacts = {
  action: "train a model",
  purpose: "a commercial product",
  distribution: "outputs distributed publicly",
  territory: "worldwide",
  attribution: "attribution will be displayed",
  source_redistribution: false,
  third_party_access: false,
  extra_facts: "Outputs are aggregate population projections, do not reproduce source rows, and identify material changes to the source data.",
};

export const DENIED_SAMPLE_INTENT_FACTS: IntentFacts = {
  action: "redistribute copies",
  purpose: "a commercial product",
  distribution: "outputs shared with clients",
  territory: "worldwide",
  attribution: "attribution will be displayed",
  source_redistribution: true,
  third_party_access: true,
  extra_facts: "The client deliverable includes the complete source tables, and each client will receive access to the source data.",
};

export const UNCLEAR_SAMPLE_INTENT_FACTS: IntentFacts = {
  action: "analyse the material",
  purpose: "insurance underwriting",
  distribution: "outputs kept internal",
  territory: "worldwide",
  attribution: "attribution will be displayed",
  source_redistribution: false,
  third_party_access: false,
  extra_facts: "Use the aggregate projections to inform individual applicant eligibility decisions. No model is trained, and no source files are shared.",
};
