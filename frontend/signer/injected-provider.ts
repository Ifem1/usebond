"use client";

import { NETWORK } from "@/genlayer-runtime/config";

export type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: InjectedProvider;
  }
}

export function provider(): InjectedProvider | null {
  return typeof window === "undefined" ? null : window.ethereum || null;
}

export async function existingAccounts(): Promise<string[]> {
  const p = provider();
  if (!p) return [];
  return (await p.request({ method: "eth_accounts" })) || [];
}

export async function connectAccount(): Promise<string> {
  const p = provider();
  if (!p) throw new Error("No injected EIP-1193 wallet was found.");
  const accounts = (await p.request({ method: "eth_requestAccounts" })) || [];
  if (!accounts[0]) throw new Error("No wallet account was selected.");
  await ensureStudionet();
  return String(accounts[0]);
}

export async function ensureStudionet() {
  const p = provider();
  if (!p) throw new Error("No injected wallet was found.");
  const current = String(await p.request({ method: "eth_chainId" })).toLowerCase();
  if (parseInt(current, 16) === NETWORK.chainId) return;
  try {
    await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: NETWORK.chainHex }] });
  } catch (error: any) {
    if (error?.code !== 4902) throw error;
    await p.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: NETWORK.chainHex,
          chainName: NETWORK.name,
          rpcUrls: [NETWORK.rpc],
          nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
          blockExplorerUrls: [NETWORK.explorer],
        },
      ],
    });
  }
}
