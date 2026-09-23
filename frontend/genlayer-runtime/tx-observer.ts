"use client";

import { readonlyClient, signedClient } from "./client";

export type ObservedStage =
  | "SUBMITTED"
  | "CONSENSUS_RUNNING"
  | "PROVISIONAL"
  | "READY_TO_FINALIZE"
  | "FINALIZED"
  | "UNDETERMINED"
  | "FAILED";

export type TxObservation = {
  hash: string;
  stage: ObservedStage;
  statusName: string;
  raw: unknown;
};

function statusName(tx: any): string {
  return String(tx?.statusName || tx?.status || "").toUpperCase();
}

export function projectStatus(name: string): ObservedStage {
  if (name === "FINALIZED" || name === "7") return "FINALIZED";
  if (name === "READY_TO_FINALIZE" || name === "11") return "READY_TO_FINALIZE";
  if (name === "ACCEPTED" || name === "5") return "PROVISIONAL";
  if (name === "UNDETERMINED" || name === "6") return "UNDETERMINED";
  if (["CANCELED", "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT", "8", "12", "13"].includes(name)) return "FAILED";
  return "CONSENSUS_RUNNING";
}

export async function inspectTransaction(hash: string): Promise<TxObservation> {
  const client = readonlyClient();
  const tx = await client.getTransaction({ hash: hash as `0x${string}` } as any);
  const name = statusName(tx);
  return { hash, statusName: name, stage: projectStatus(name), raw: tx };
}

export async function observeTransaction(
  hash: string,
  onChange: (value: TxObservation) => void,
  options: { interval?: number; maxPolls?: number } = {},
): Promise<TxObservation> {
  const interval = options.interval ?? 4500;
  const maxPolls = options.maxPolls ?? 160;
  let last: TxObservation = { hash, stage: "SUBMITTED", statusName: "SUBMITTED", raw: null };
  onChange(last);

  for (let i = 0; i < maxPolls; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, i === 0 ? 800 : interval));
    last = await inspectTransaction(hash);
    onChange(last);
    if (["FINALIZED", "UNDETERMINED", "FAILED", "READY_TO_FINALIZE"].includes(last.stage)) return last;
  }
  return last;
}

export async function triggeredTransactions(hash: string): Promise<string[]> {
  const client = readonlyClient();
  const ids = await client.getTriggeredTransactionIds({ hash: hash as `0x${string}` } as any);
  return Array.isArray(ids) ? ids.map(String) : [];
}

export async function finalizeTransaction(hash: string, account: string): Promise<string> {
  const client = signedClient(account);
  const evmHash = await client.finalizeTransaction({
    account: account as `0x${string}`,
    txId: hash as `0x${string}`,
  } as any);
  return String(evmHash);
}
