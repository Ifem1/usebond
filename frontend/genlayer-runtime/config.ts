export const NETWORK = {
  chainId: Number(process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"),
  chainHex: "0xF22F",
  name: "GenLayer Studionet",
  rpc: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api",
  explorer: process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || "https://explorer-studio.genlayer.com",
  symbol: "GEN",
} as const;

export const ADDRESSES = {
  registry: process.env.NEXT_PUBLIC_RIGHTS_REGISTRY_ADDRESS || "",
  engine: process.env.NEXT_PUBLIC_PERMISSION_ENGINE_ADDRESS || "",
  permitBook: process.env.NEXT_PUBLIC_PERMIT_BOOK_ADDRESS || "",
} as const;

export function deploymentReady(): boolean {
  return [ADDRESSES.registry, ADDRESSES.engine, ADDRESSES.permitBook].every(
    (value) => /^0x[0-9a-fA-F]{40}$/.test(value),
  );
}

export function explorerTx(hash: string): string {
  return `${NETWORK.explorer.replace(/\/$/, "")}/transactions/${hash}`;
}

export function explorerAddress(address: string): string {
  return `${NETWORK.explorer.replace(/\/$/, "")}/address/${address}`;
}
