import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  DecodedDeployData,
  GenLayerChain,
  GenLayerClient,
  TransactionHash,
} from "genlayer-js/types";
import { localnet } from "genlayer-js/chains";

const CHAIN_ID = 61999;
const RPC = "https://studio.genlayer.com/api";

function code(file: string): Uint8Array {
  return new Uint8Array(readFileSync(path.resolve(process.cwd(), "contracts", file)));
}

async function waitFinal(client: GenLayerClient<any>, hash: TransactionHash) {
  return client.waitForTransactionReceipt({
    hash,
    waitUntil: "finalized",
    retries: 360,
    interval: 5000,
    fullTransaction: true,
  } as any);
}

function deployedAddress(client: GenLayerClient<any>, receipt: any): string {
  const value =
    (client.chain as GenLayerChain).id === localnet.id
      ? receipt?.data?.contract_address
      : (receipt?.txDataDecoded as DecodedDeployData | undefined)?.contractAddress;
  if (!value) throw new Error(`Deployment finalized but address was not decoded: ${JSON.stringify(receipt)}`);
  return String(value);
}

async function deployOne(client: GenLayerClient<any>, file: string, args: unknown[]): Promise<string> {
  const txId = await client.deployContract({ code: code(file), args });
  console.log(`[deploy] ${file}: ${txId}`);
  const receipt = await waitFinal(client, txId as TransactionHash);
  const address = deployedAddress(client, receipt);
  console.log(`[finalized] ${file}: ${address}`);
  return address;
}

async function writeAndFinalize(
  client: GenLayerClient<any>,
  address: `0x${string}`,
  functionName: string,
  args: unknown[],
): Promise<string> {
  const estimate = await client.estimateTransactionFeesForWrite({
    address,
    functionName,
    args,
    value: 0n,
  } as any);

  const txId = await client.writeContract({
    address,
    functionName,
    args,
    value: 0n,
    fees: {
      distribution: estimate.distribution,
      feeValue: estimate.feeValue,
    },
  } as any);
  console.log(`[write] ${functionName}: ${txId}`);
  await waitFinal(client, txId as TransactionHash);
  console.log(`[finalized] ${functionName}: ${txId}`);
  return String(txId);
}

export default async function main(client: GenLayerClient<any>) {
  if (Number(client.chain?.id) !== CHAIN_ID) {
    throw new Error(`USEBOND must deploy to Studionet ${CHAIN_ID}; connected chain is ${client.chain?.id}`);
  }

  console.log(`USEBOND deployment target: Studionet ${CHAIN_ID} (${RPC})`);
  await client.initializeConsensusSmartContract();

  const registry = await deployOne(client, "rights_registry.py", []);
  const permitBook = await deployOne(client, "permit_book.py", []);
  const engine = await deployOne(client, "permission_engine.py", [registry, permitBook]);
  const bindTx = await writeAndFinalize(
    client,
    permitBook as `0x${string}`,
    "bind_engine",
    [engine],
  );

  const env = [
    "NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999",
    "NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api",
    "NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com",
    `NEXT_PUBLIC_RIGHTS_REGISTRY_ADDRESS=${registry}`,
    `NEXT_PUBLIC_PERMISSION_ENGINE_ADDRESS=${engine}`,
    `NEXT_PUBLIC_PERMIT_BOOK_ADDRESS=${permitBook}`,
    "",
  ].join("\n");
  writeFileSync(path.resolve(process.cwd(), ".env.generated"), env);

  const manifest = {
    network: "studionet",
    chainId: CHAIN_ID,
    rpc: RPC,
    contracts: { registry, permissionEngine: engine, permitBook },
    bindEngineTransaction: bindTx,
    generatedAt: new Date().toISOString(),
    warning: "Re-verify all addresses and FINALIZED transaction states in the explorer before submission.",
  };
  writeFileSync(
    path.resolve(process.cwd(), "deployment-manifest.generated.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(JSON.stringify(manifest, null, 2));
}
