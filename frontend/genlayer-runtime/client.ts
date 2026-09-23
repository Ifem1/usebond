"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { NETWORK } from "./config";

export function readonlyClient() {
  return createClient({ chain: studionet, endpoint: NETWORK.rpc } as any);
}

export function signedClient(account: string) {
  const injected = typeof window !== "undefined" ? (window as any).ethereum : undefined;
  if (!injected) throw new Error("No injected EIP-1193 wallet was found.");
  return createClient({
    chain: studionet,
    account: account as `0x${string}`,
    provider: injected,
    endpoint: NETWORK.rpc,
  } as any);
}
