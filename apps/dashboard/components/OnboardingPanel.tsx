"use client";

import { FormEvent, useState } from "react";

type WalletResponse = {
  publicKey: string;
  secretKey: string;
  network: string;
  warning: string;
};

type RegistrationResponse = {
  agentId: string;
  apiKey: string;
  publicKey: string;
  createdAt: string;
};

async function postJson<T>(path: string, body?: Record<string, string>) {
  const init: RequestInit = body
    ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    : {
        method: "POST"
      };

  const response = await fetch(path, init);

  const payload = (await response.json().catch(() => null)) as
    | T
    | { error?: string; issues?: unknown }
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && payload.error
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function OnboardingPanel() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [registration, setRegistration] = useState<RegistrationResponse | null>(null);
  const [name, setName] = useState("Aurora Agent");
  const [publicKey, setPublicKey] = useState("");
  const [walletError, setWalletError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [walletPending, setWalletPending] = useState(false);
  const [registrationPending, setRegistrationPending] = useState(false);
  const [copied, setCopied] = useState<"api" | "secret" | null>(null);

  async function handleWalletCreate() {
    setWalletPending(true);
    setWalletError(null);
    try {
      const response = await postJson<WalletResponse>("/api/wallet/create");
      setWallet(response);
      setPublicKey(response.publicKey);
      setCopied(null);
    } catch (error) {
      setWalletError(error instanceof Error ? error.message : "Wallet bootstrap failed");
    } finally {
      setWalletPending(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistrationPending(true);
    setRegistrationError(null);

    try {
      const response = await postJson<RegistrationResponse>("/api/register", {
        name,
        publicKey
      });
      setRegistration(response);
      setCopied(null);
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setRegistrationPending(false);
    }
  }

  async function copyValue(value: string, kind: "api" | "secret") {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <section className="section launchpad">
      <div className="panel launchpad__panel">
        <div className="panel__header">
          <div>
            <p className="launchpad__eyebrow">Phase 2</p>
            <h2>Bootstrap an agent in two steps</h2>
            <p className="subtle">
              Generate a testnet wallet, then register the agent and receive an API key for the payment routes.
            </p>
          </div>
          <div className="launchpad__badge">Testnet first</div>
        </div>

        <div className="launchpad__grid">
          <article className="mini-card launchpad__card">
            <p className="mini-card__label">1. Create wallet</p>
            <p className="launchpad__copy">
              This returns a fresh Stellar keypair and funds it with Friendbot on testnet.
            </p>
            <button
              className="button button--primary launchpad__button"
              type="button"
              onClick={handleWalletCreate}
              disabled={walletPending}
            >
              {walletPending ? "Creating wallet..." : "Create testnet wallet"}
            </button>
            {walletError ? <p className="launchpad__error">{walletError}</p> : null}
            {wallet ? (
              <div className="launchpad__result">
                <div>
                  <p className="launchpad__result-label">Public key</p>
                  <p className="launchpad__mono">{wallet.publicKey}</p>
                </div>
                <div>
                  <p className="launchpad__result-label">Secret key</p>
                  <p className="launchpad__mono">{wallet.secretKey}</p>
                </div>
                <div className="launchpad__result-actions">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => copyValue(wallet.publicKey, "api")}
                  >
                    Copy public key
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => copyValue(wallet.secretKey, "secret")}
                  >
                    Copy secret key
                  </button>
                </div>
                <p className="launchpad__note">{wallet.warning}</p>
              </div>
            ) : null}
          </article>

          <article className="mini-card launchpad__card">
            <p className="mini-card__label">2. Register agent</p>
            <form className="launchpad__form" onSubmit={handleRegister}>
              <label className="launchpad__field">
                <span>Agent name</span>
                <input
                  className="launchpad__input"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  placeholder="Aurora Agent"
                />
              </label>
              <label className="launchpad__field">
                <span>Public key</span>
                <input
                  className="launchpad__input"
                  name="publicKey"
                  value={publicKey}
                  onChange={(event) => setPublicKey(event.currentTarget.value)}
                  placeholder="G..."
                />
              </label>
              <div className="launchpad__result-actions">
                <button className="button button--primary" type="submit" disabled={registrationPending}>
                  {registrationPending ? "Registering..." : "Register agent"}
                </button>
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => {
                    setName("Aurora Agent");
                    setPublicKey(wallet?.publicKey ?? "");
                  }}
                >
                  Fill from wallet
                </button>
              </div>
            </form>
            {registrationError ? <p className="launchpad__error">{registrationError}</p> : null}
            {registration ? (
              <div className="launchpad__result">
                <div>
                  <p className="launchpad__result-label">Agent ID</p>
                  <p className="launchpad__mono">{registration.agentId}</p>
                </div>
                <div>
                  <p className="launchpad__result-label">API key</p>
                  <p className="launchpad__mono">{registration.apiKey}</p>
                </div>
                <div className="launchpad__result-actions">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => copyValue(registration.apiKey, "api")}
                  >
                    Copy API key
                  </button>
                </div>
                <p className="launchpad__note">
                  Store the API key securely. It is returned once and hashed on the server.
                </p>
                {copied ? <p className="launchpad__copy-state">Copied {copied === "api" ? "API key" : "secret key"}</p> : null}
              </div>
            ) : null}
          </article>
        </div>
      </div>
    </section>
  );
}
