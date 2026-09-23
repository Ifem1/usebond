"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { connectAccount, ensureStudionet, existingAccounts, provider } from "./injected-provider";

const DISCONNECTED_KEY = "usebond:wallet-disconnected";

export type RightsIdentity = {
  address: string | null;
  ready: boolean;
  error: string;
  connect: () => Promise<string>;
  disconnect: () => void;
  ensureNetwork: () => Promise<void>;
};

const Context = createContext<RightsIdentity | null>(null);

export function RightsIdentityScope({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const manuallyDisconnected = window.sessionStorage.getItem(DISCONNECTED_KEY) === "1";

    if (manuallyDisconnected) {
      setReady(true);
    } else {
      existingAccounts()
        .then((accounts) => mounted && setAddress(accounts[0] || null))
        .finally(() => mounted && setReady(true));
    }

    const p = provider();
    const accountHandler = (accounts: string[]) => {
      if (window.sessionStorage.getItem(DISCONNECTED_KEY) === "1") return;
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
      window.sessionStorage.removeItem(DISCONNECTED_KEY);
      setAddress(value);
      return value;
    } catch (e: any) {
      setError(e?.message || "Wallet connection failed.");
      throw e;
    }
  }, []);

  const disconnect = useCallback(() => {
    window.sessionStorage.setItem(DISCONNECTED_KEY, "1");
    setAddress(null);
    setError("");
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

  const value = useMemo(
    () => ({ address, ready, error, connect, disconnect, ensureNetwork }),
    [address, ready, error, connect, disconnect, ensureNetwork],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRightsIdentity() {
  const value = useContext(Context);
  if (!value) throw new Error("useRightsIdentity must be used inside RightsIdentityScope");
  return value;
}

export function RightsIdentityMark() {
  const identity = useRightsIdentity();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function copyAddress() {
    if (!identity.address) return;
    try {
      await navigator.clipboard.writeText(identity.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      const input = document.createElement("textarea");
      input.value = identity.address;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    }
  }

  if (!identity.ready) {
    return <span className="identity-mark muted">Wallet…</span>;
  }

  if (!identity.address) {
    return (
      <button
        className="identity-mark"
        type="button"
        aria-label="Connect injected wallet"
        title={identity.error || "Connect wallet"}
        onClick={() => { void identity.connect().catch(() => undefined); }}
      >
        Connect wallet
      </button>
    );
  }

  return (
    <div className="identity-menu-wrap" ref={menuRef}>
      <button
        className="identity-mark"
        type="button"
        aria-label="Open wallet menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="identity-dot" /> {identity.address.slice(0, 6)}…{identity.address.slice(-4)}
        <span className="identity-chevron" aria-hidden="true">{open ? "↑" : "↓"}</span>
      </button>

      {open && (
        <div className="identity-dropdown" role="menu">
          <button
            type="button"
            role="menuitem"
            className="identity-menu-item"
            onClick={() => { void copyAddress(); }}
          >
            <span>{copied ? "Copied!" : "Copy wallet"}</span>
            <span className="identity-menu-icon" aria-hidden="true">{copied ? "✓" : "⧉"}</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="identity-menu-item danger"
            onClick={() => {
              identity.disconnect();
              setOpen(false);
            }}
          >
            <span>Disconnect</span>
            <span className="identity-menu-icon" aria-hidden="true">↗</span>
          </button>
        </div>
      )}
    </div>
  );
}
