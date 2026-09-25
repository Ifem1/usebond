"use client";

import { ADDRESSES, deploymentReady } from "./config";
import { readonlyClient } from "./client";
import { inspectTransaction } from "./tx-observer";
import { permitFromFinalizedIssuance } from "./permit-evidence";
import type { IntentRecord, LicenceRecord, PermitRecord } from "./models";
import { parseJson } from "./models";

function assertDeployment() {
  if (!deploymentReady()) throw new Error("USEBOND contract addresses are not configured.");
}

export async function listLicenceKeys(): Promise<string[]> {
  assertDeployment();
  const client = readonlyClient();
  const raw = await client.readContract({
    address: ADDRESSES.registry as `0x${string}`,
    functionName: "list_licence_keys",
    args: [],
  } as any);
  return Array.isArray(raw) ? raw.map(String) : [];
}

export async function readLicence(key: string): Promise<LicenceRecord | null> {
  assertDeployment();
  const client = readonlyClient();
  const raw = await client.readContract({
    address: ADDRESSES.registry as `0x${string}`,
    functionName: "get_licence_json",
    args: [key],
  } as any);
  return parseJson<LicenceRecord>(raw);
}

export async function readIntent(key: string): Promise<IntentRecord | null> {
  assertDeployment();
  const client = readonlyClient();
  const raw = await client.readContract({
    address: ADDRESSES.engine as `0x${string}`,
    functionName: "get_intent_json",
    args: [key],
  } as any);
  return parseJson<IntentRecord>(raw);
}

export async function readPermit(key: string): Promise<PermitRecord | null> {
  assertDeployment();
  const client = readonlyClient();
  const raw = await client.readContract({
    address: ADDRESSES.permitBook as `0x${string}`,
    functionName: "get_permit_json",
    args: [key],
  } as any);
  return parseJson<PermitRecord>(raw);
}

export async function permitExists(key: string): Promise<boolean> {
  assertDeployment();
  const client = readonlyClient();
  return Boolean(
    await client.readContract({
      address: ADDRESSES.permitBook as `0x${string}`,
      functionName: "has_permit",
      args: [key],
    } as any),
  );
}


export async function findFinalizedPermitTransaction(permitKey: string): Promise<string | null> {
  assertDeployment();
  const client = readonlyClient();
  try {
    const result = await client.request({
      method: "sim_getTransactionsForAddress",
      // Studionet's index returns decoded transaction metadata only with its
      // default filter; the optional `to` filter omits the call payload there.
      params: [ADDRESSES.permitBook.toLowerCase() as `0x${string}`],
    } as any);
    const entries = Array.isArray(result)
      ? result
      : Array.isArray((result as any)?.transactions)
        ? (result as any).transactions
        : Array.isArray((result as any)?.result)
          ? (result as any).result
          : [];
    for (const item of entries.slice(0, 100)) {
      const tx: any = item;
      const hash = String(typeof item === "string" ? item : tx?.hash || tx?.transaction_hash || tx?.transactionHash || tx?.transaction_id || tx?.txId || tx?.txID || tx?.tx_id || tx?.id || "");
      if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) continue;
      const observation = await inspectTransaction(hash);
      if (permitFromFinalizedIssuance(observation.raw, permitKey)) return hash;
    }
  } catch {
    return null;
  }
  return null;
}
