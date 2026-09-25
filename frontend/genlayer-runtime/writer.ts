"use client";

import { ADDRESSES, deploymentReady } from "./config";
import { signedClient } from "./client";
import type { IntentFacts } from "./models";
import { createIntentArguments } from "./intent-payload";

function assertReady(account: string) {
  if (!deploymentReady()) throw new Error("Deployment configuration is incomplete.");
  if (!/^0x[0-9a-fA-F]{40}$/.test(account)) throw new Error("A wallet identity is required.");
}

async function write(
  account: string,
  address: string,
  functionName: string,
  args: unknown[],
): Promise<string> {
  assertReady(account);
  const client = signedClient(account);
  const hash = await client.writeContract({
    address: address as `0x${string}`,
    functionName,
    args,
    value: 0n,
  } as any);
  return String(hash);
}

export async function registerLicence(
  account: string,
  input: {
    key: string;
    title: string;
    assetType: string;
    canonicalSource: string;
    rightsHolder: string;
    termsText: string;
    rightsMap: Record<string, string>;
  },
) {
  return write(account, ADDRESSES.registry, "register_licence", [
    input.key,
    input.title,
    input.assetType,
    input.canonicalSource,
    input.rightsHolder,
    input.termsText,
    JSON.stringify(input.rightsMap),
  ]);
}

export async function createIntent(
  account: string,
  intentKey: string,
  licenceKey: string,
  facts: IntentFacts,
) {
  return write(account, ADDRESSES.engine, "create_intent", createIntentArguments(intentKey, licenceKey, facts));
}

export async function evaluateIntent(account: string, intentKey: string) {
  return write(account, ADDRESSES.engine, "evaluate_intent", [intentKey]);
}
