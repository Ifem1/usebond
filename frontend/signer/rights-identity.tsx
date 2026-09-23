"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { connectAccount, ensureStudionet, existingAccounts, provider } from "./injected-provider";

export type RightsIdentity = {
  address: string | null;
  ready: boolean;
  error: string;
  connect: () => Promise<string>;
  ensureNetwork: () => Promise<void>;
};

const Context = createContext<RightsIdentity | null>(null);

export function RightsIdentityScope({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    existingAccounts()
      .then((accounts) => mounted && setAddress(accounts[0] || null))
      .finally(() => mounted && setReady(true));

    const p = provider();
    const accountHandler = (accounts: string[]) => {
      setAddress(accounts?.[0] || null);
      setError("");
    };
    if (p?.on) p.on("accountsChanged", accountHandler);
    return () => {
      mounted = false;
      p?.removeListener?.("accountsChanged", accountHandler);
    };
  }, []);

  const connect = useCallback(async () => {
    setError("");
    try {
      const value = await connectAccount();
      setAddress(value);
      return value;
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed.");
      throw e;
    }
  }, []);

  const ensureNetwork = useCallback(async () => {
    setError("");
    try {
      await ensureStudionet();
    } catch (e: any) {
      setError(e?.message || "Could not switch network.");
      throw e;
    }
  }, []);

  const value = useMemo(() => ({ address, ready, error, connect, ensureNetwork }), [address, ready, error, connect, ensureNetwork]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRightsIdentity() {
  const value = useContext(Context);
  if (!value) throw new Error("useRightsIdentity must be used inside RightsIdentityScope");
  return value;
}

export function RightsIdentityMark() {
  const identity = useRightsIdentity();

  if (!identity.ready) {
    return <span className="identity-mark muted">Wallet…</span>;
  }

  if (!identity.address) {
    return (
      <button
        className="identity-mark"
        type="button"
        aria-label="Connect injected wallet"
        title={identity.error || "Connect an injected EIP-1193 wallet"}
        onClick={() => { void identity.connect().catch(() => undefined); }}
      >
        Connect wallet
      </button>
    );
  }

  return (
    <button
      className="identity-mark"
      type="button"
      aria-label="Connected wallet. Ensure GenLayer Studionet"
      title={identity.error || "Connected · click to ensure Studionet 61999"}
      onClick={() => { void identity.ensureNetwork().catch(() => undefined); }}
    >
      <span className="identity-dot" /> {identity.address.slice(0, 6)}…{identity.address.slice(-4)}
    </button>
  );
}
