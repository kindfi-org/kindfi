# Pollar Documentation



**Pollar** is the onboarding-to-payment infrastructure layer for consumer apps on Stellar. The full stack from social login to USDC payments — without exposing users to blockchain complexity.

* [dashboard.pollar.xyz](https://dashboard.pollar.xyz) — Create an app and get your API keys

* [github.com/pollar-xyz/pollar](https://github.com/pollar-xyz/pollar) — Open source SDK

* [Telegram](https://t.me/+R76f1BarXSUxMTQx) — Pollar community

Getting Started [#getting-started]

| <br />                                                                  | <br />                                          |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [Overview](https://docs.pollar.xyz/docs/getting-started/overview)       | What Pollar is and the problem it solves        |
| [API Keys](https://docs.pollar.xyz/docs/getting-started/api-keys)       | Publishable vs secret keys, testnet vs mainnet  |
| [Quickstart](https://docs.pollar.xyz/docs/getting-started/quickstart)   | Install, configure, and send your first payment |
| [Example App](https://docs.pollar.xyz/docs/getting-started/example-app) | Clone and run a full working integration        |

***

Core Concepts [#core-concepts]

| <br />                                                                                | <br />                                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [Architecture](https://docs.pollar.xyz/docs/core-concepts/architecture)               | How the SDK, Pollar Server, and Dashboard work together |
| [Funding Modes](https://docs.pollar.xyz/docs/core-concepts/funding-modes)             | Immediate and Deferred wallet activation                |
| [Stellar Primitives](https://docs.pollar.xyz/docs/core-concepts/stellar-primitives)   | Fee-bumps, reserves, trustlines, SEP-10, SEP-24         |
| [Security Model](https://docs.pollar.xyz/docs/core-concepts/security-model)           | AWS KMS, Passkeys, BYOK, and MPC                        |
| [Transaction History](https://docs.pollar.xyz/docs/core-concepts/transaction-history) | Two-layer history architecture and pagination           |

***

SDK Reference [#sdk-reference]

| <br />                                                                        | <br />                                                        |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [@pollar/react](https://docs.pollar.xyz/docs/sdk-reference/pollar-react)      | Hooks and pre-built UI components                             |
| [@pollar/core](https://docs.pollar.xyz/docs/sdk-reference/pollar-core)        | Full TypeScript client API                                    |
| [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters) | External + embedded wallet login (Stellar Wallets Kit, Privy) |
| [Pollar Server API](https://docs.pollar.xyz/docs/sdk-reference/server-api)    | REST endpoints for backend use                                |
| [Webhooks](https://docs.pollar.xyz/docs/sdk-reference/webhooks)               | Events, HMAC authentication, and retry behavior               |
| [Error Codes](https://docs.pollar.xyz/docs/sdk-reference/error-codes)         | All error codes with causes and fixes                         |
| [MCP Gateway](https://docs.pollar.xyz/docs/sdk-reference/mcp-gateway)         | MCP / AI-agent access via Personal Access Tokens              |

***

Operator Guide [#operator-guide]

The sections below mirror the Dashboard sidebar: **Overview · Build · Users · Treasury · Integrations · Monitor · Danger Zone**. Start with the [Dashboard Overview](https://docs.pollar.xyz/docs/operator-guide/dashboard-overview).

**Overview**

| <br />                                                                          | <br />               |
| ------------------------------------------------------------------------------- | -------------------- |
| [Home](https://docs.pollar.xyz/docs/operator-guide/overview/home)               | Your app at a glance |
| [Get started](https://docs.pollar.xyz/docs/operator-guide/overview/get-started) | Onboarding checklist |

**Build**

| <br />                                                                 | <br />                              |
| ---------------------------------------------------------------------- | ----------------------------------- |
| [Settings](https://docs.pollar.xyz/docs/operator-guide/build/settings) | App name and general configuration  |
| [API Keys](https://docs.pollar.xyz/docs/operator-guide/build/api-keys) | Generate and manage keys            |
| [Domains](https://docs.pollar.xyz/docs/operator-guide/build/domains)   | Allowed origins for SDK requests    |
| [Webhooks](https://docs.pollar.xyz/docs/operator-guide/build/webhooks) | Event delivery endpoints (upcoming) |
| [Branding](https://docs.pollar.xyz/docs/operator-guide/build/branding) | Customize the Pollar modals         |
| [Members](https://docs.pollar.xyz/docs/operator-guide/build/members)   | Team access (owner only)            |

**Users**

| <br />                                                                 | <br />                         |
| ---------------------------------------------------------------------- | ------------------------------ |
| [Accounts](https://docs.pollar.xyz/docs/operator-guide/users/accounts) | Browse and manage app users    |
| [Wallets](https://docs.pollar.xyz/docs/operator-guide/users/wallets)   | Browse and manage user wallets |

**Treasury**

| <br />                                                                                        | <br />                                                 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| [Tokens & Trustlines](https://docs.pollar.xyz/docs/operator-guide/treasury/tokens-trustlines) | Configure assets for user wallets                      |
| [Funding Mode](https://docs.pollar.xyz/docs/operator-guide/treasury/funding-mode)             | Immediate and Deferred (set on Account Funding)        |
| [Account Funding](https://docs.pollar.xyz/docs/operator-guide/treasury/account-funding)       | Your funding (reserve) wallet                          |
| [Sponsorship](https://docs.pollar.xyz/docs/operator-guide/treasury/sponsorship)               | Transaction fee sponsorship                            |
| [Transaction Policy](https://docs.pollar.xyz/docs/operator-guide/treasury/transaction-policy) | Restrict sensitive operations (account merge, max fee) |
| [Auth Policy](https://docs.pollar.xyz/docs/operator-guide/treasury/auth-policy)               | Soroban authorization allowlist                        |
| [Swap](https://docs.pollar.xyz/docs/operator-guide/treasury/swap)                             | Swap venues exposed to users                           |
| [Earn](https://docs.pollar.xyz/docs/operator-guide/treasury/earn)                             | Yield providers (DeFindex, Blend)                      |
| [Token Distribution](https://docs.pollar.xyz/docs/operator-guide/treasury/token-distribution) | Claimable distribution rules                           |

**Integrations**

| <br />                                                                                    | <br />                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| [Authentication](https://docs.pollar.xyz/docs/operator-guide/integrations/authentication) | OAuth providers and email OTP (upcoming)   |
| [KYC](https://docs.pollar.xyz/docs/operator-guide/integrations/kyc)                       | Identity-verification providers (upcoming) |
| [Ramps](https://docs.pollar.xyz/docs/operator-guide/integrations/ramps)                   | Fiat on/off-ramp providers                 |
| [Pollar Pay](https://docs.pollar.xyz/docs/operator-guide/integrations/pollar-pay)         | Pollar Pay integration                     |

**Monitor**

| <br />                                                                           | <br />                               |
| -------------------------------------------------------------------------------- | ------------------------------------ |
| [Transactions](https://docs.pollar.xyz/docs/operator-guide/monitor/transactions) | On-chain transaction log             |
| [Logs](https://docs.pollar.xyz/docs/operator-guide/monitor/logs)                 | API request and delivery logs        |
| [Alerts](https://docs.pollar.xyz/docs/operator-guide/monitor/alerts)             | Low-balance notifications (upcoming) |

**Danger Zone**

| <br />                                                                             | <br />                                   |
| ---------------------------------------------------------------------------------- | ---------------------------------------- |
| [Archive app](https://docs.pollar.xyz/docs/operator-guide/danger-zone/archive-app) | Archive / unarchive the app (owner only) |

***

Guides [#guides]

| <br />                                                                         | <br />                                    |
| ------------------------------------------------------------------------------ | ----------------------------------------- |
| [Deferred Flow Guide](https://docs.pollar.xyz/docs/guides/deferred-flow-guide) | KYC-gated wallet activation with webhooks |
| [Passkeys Guide](https://docs.pollar.xyz/docs/guides/passkeys-guide)           | Biometric auth with Face ID and Touch ID  |
| [Payments UI](https://docs.pollar.xyz/docs/guides/payments-ui)                 | Send, receive, and history components     |
| [Mainnet Checklist](https://docs.pollar.xyz/docs/guides/mainnet-checklist)     | Everything to verify before going live    |


# Architecture



Pollar sits between your app and the Stellar network. This page explains how the three components interact and how requests flow from your frontend to the blockchain.

***

The three components [#the-three-components]

<Mermaid
  chart="flowchart TD
    A(&#x22;Your App\nRemittances · Neobank · Wallet&#x22;):::external

    subgraph pollar[&#x22;Pollar&#x22;]
        B(&#x22;1. SDK\n@pollar/core · @pollar/react&#x22;):::sdk
        C(&#x22;2. Pollar Server\napi.pollar.xyz&#x22;):::server
        D(&#x22;3. Dashboard\ndashboard.pollar.xyz&#x22;):::dashboard
    end

    E(&#x22;Stellar Network\nTestnet · Mainnet&#x22;):::external
    F(&#x22;AWS KMS\nKey management&#x22;):::infra
    G(&#x22;PostgreSQL\nTransaction history&#x22;):::infra

    A -->|&#x22;calls&#x22;| B
    B -->|&#x22;HTTP&#x22;| C
    C -->|&#x22;submits transactions&#x22;| E
    C -->|&#x22;encrypts / decrypts keys&#x22;| F
    C -->|&#x22;persists tx history&#x22;| G
    D -.->|&#x22;configures&#x22;| C

    classDef external fill:#f1efe8,stroke:#b4b2a9,color:#444441
    classDef sdk fill:#e1f5ee,stroke:#1d9e75,color:#085041
    classDef server fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef dashboard fill:#faeeda,stroke:#ba7517,color:#633806
    classDef infra fill:#e6f1fb,stroke:#378add,color:#0c447c"
/>

| Component                                 | Runs where                                 | Your responsibility                                                |
| ----------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| **SDK** (`@pollar/core`, `@pollar/react`) | Your frontend                              | Install and configure with your publishable key                    |
| **Pollar Server**                         | Hosted by Pollar at `api.pollar.xyz`       | Nothing — you call it via the SDK or REST API                      |
| **Dashboard**                             | Hosted by Pollar at `dashboard.pollar.xyz` | Configure your app settings, funding mode, and sponsorship wallets |

***

Networks [#networks]

| Network     | Notes                                               |
| ----------- | --------------------------------------------------- |
| **Testnet** | Development and testing. Free, resets periodically. |
| **Mainnet** | Production. Real XLM required.                      |

Futurenet is not supported by default. If your project requires it, [contact us](mailto:hello@pollar.xyz).

Each network has its own set of API keys — see [API Keys](https://docs.pollar.xyz/docs/getting-started/api-keys) for prefixes and usage rules.

> Full details on Stellar networks at [developers.stellar.org/docs/networks](https://developers.stellar.org/docs/networks).

***

App wallets [#app-wallets]

When you create an app in the Dashboard, Pollar provisions a set of Stellar accounts
that cover costs on behalf of your users — not user funds, but the infrastructure
costs of running wallets on Stellar. There are three distinct roles:

| Wallet                  | Covers                                       | Charged when               |
| ----------------------- | -------------------------------------------- | -------------------------- |
| **Funding wallet**      | XLM reserve for new user wallets             | Once per wallet activation |
| **Gas wallet**          | Transaction fees for all on-chain operations | Every transaction          |
| **Distribution wallet** | Assets sent via distribution rules           | Every claim                |

By default a single wallet is created when you create your app and covers all three
roles. This is fine for development and early-stage apps.

As your app scales, separating them into three distinct wallets gives you independent
balance tracking, separate funding schedules, and tighter control over each cost
center. For example, your gas wallet gets topped up frequently in small amounts while
your funding wallet is replenished in larger batches tied to user growth. Mixing them
in a single wallet makes it harder to monitor and plan each cost independently.

For configuration and recommended minimum balances see
[Operator guide/Configuration/App Wallets](https://docs.pollar.xyz/docs/operator-guide/treasury/account-funding).

***

Request lifecycle [#request-lifecycle]

What happens from the moment a user calls `login()` to the moment their wallet is ready:

<Mermaid
  chart="sequenceDiagram
    participant App as Your App
    participant SDK as Pollar SDK
    participant Server as Pollar Server
    participant KMS as AWS KMS
    participant Stellar as Stellar Network

    App->>SDK: login({ provider: 'google' })
    SDK->>Server: POST /wallets/create
    Server->>KMS: generateDataKey()
    KMS-->>Server: encryptedKey
    Server->>Stellar: createAccount + changeTrust
    Note over Server,Stellar: Fees and XLM reserve paid by your sponsorship wallet(s)
    Stellar-->>Server: G-address confirmed
    Server-->>SDK: { address, status }
    SDK-->>App: wallet available in usePollar()"
/>

For the deferred funding flow see [Funding Modes](https://docs.pollar.xyz/docs/core-concepts/funding-modes).

***

Security boundary [#security-boundary]

All private keys — user wallets and your app's sponsorship wallets — are managed through AWS KMS and never stored in plaintext anywhere in Pollar's infrastructure.

When the Pollar Server needs to sign a transaction, it requests a decryption from KMS. Every request leaves an immutable CloudTrail audit record.

By design, the Pollar Server can only:

* Sign fee-bump transactions (to cover transaction fees on behalf of users)

* Execute account sponsorship sequences (to fund new wallets)

The Pollar Server cannot move user funds — the sponsorship wallet only covers fees and XLM reserves and has no authority to transfer a user's assets.

For the full security model see [Security Model](https://docs.pollar.xyz/docs/core-concepts/security-model).

***

Data persistence [#data-persistence]

| Data                         | Where it lives    | Retention         |
| ---------------------------- | ----------------- | ----------------- |
| Transaction history (recent) | Stellar RPC       | 7 days            |
| Transaction history (full)   | Pollar PostgreSQL | Indefinite        |
| Encrypted private keys       | AWS KMS           | Per key lifecycle |
| App configuration            | Pollar PostgreSQL | Per app lifecycle |

The Pollar Server intercepts every fee-bump transaction it signs and persists it to PostgreSQL. Because Pollar processes all fee-bumps for your app, it has full visibility into your transaction history without indexing the entire blockchain.

For details on querying history see [Transaction History](https://docs.pollar.xyz/docs/core-concepts/transaction-history).


# Funding Modes



Every Stellar account requires a minimum XLM reserve to exist on-chain. Pollar gives you two modes to control exactly when that reserve is funded — so you only pay for users who matter to your app.

Configure the funding mode from **Dashboard → Treasury → Funding Mode**. No code changes required.

***

The two modes [#the-two-modes]

<Mermaid
  chart="flowchart TD
    A(&#x22;User registers&#x22;):::neutral
    A --> B{&#x22;Funding mode&#x22;}:::decision
    B -->|&#x22;Immediate&#x22;| C(&#x22;Wallet funded on registration\n~2 XLM charged at login&#x22;):::immediate
    B -->|&#x22;Deferred&#x22;| D(&#x22;G-address created, no reserve\nActivated via webhook from your backend&#x22;):::deferred
    C --> E(&#x22;Wallet ready&#x22;):::ready
    D --> F(&#x22;Wallet pending&#x22;):::pending
    F -->|&#x22;POST /v1/wallets/activate\nor Dashboard Fund button&#x22;| E

    classDef neutral fill:#f1efe8,stroke:#b4b2a9,color:#444441
    classDef decision fill:#faeeda,stroke:#ba7517,color:#633806
    classDef immediate fill:#eaf3de,stroke:#639922,color:#3b6d11
    classDef deferred fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef ready fill:#eaf3de,stroke:#639922,color:#3b6d11
    classDef pending fill:#e6f1fb,stroke:#378add,color:#0c447c"
/>

| Mode          | XLM cost                    | Activation trigger        | Best for                                      |
| ------------- | --------------------------- | ------------------------- | --------------------------------------------- |
| **Immediate** | \~2 XLM per registration    | Automatic on login        | Apps without compliance requirements          |
| **Deferred**  | \~2 XLM per activation only | Webhook from your backend | Neobanks, remittance apps, KYC-gated products |

In both modes, any individual wallet can also be activated manually from &#x2A;*Dashboard → Users → Wallets (Fund 2 XLM)**. This is useful as a fallback or for support workflows.

> **How the \~2 XLM is calculated:** Every Stellar account requires a base reserve of **1 XLM**. Each trustline (asset) you configure in the Dashboard adds **0.5 XLM**:
>
> `1 XLM + (number of configured assets × 0.5 XLM)`
>
> | Assets configured    | Reserve required |
> | -------------------- | ---------------- |
> | 0                    | 1 XLM            |
> | 1 (e.g. USDC)        | 1.5 XLM          |
> | 2 (e.g. USDC + EURC) | 2 XLM            |
> | 3                    | 2.5 XLM          |
>
> Pollar does not charge extra — the full amount is consumed from your funding wallet.
>
> References: [Minimum Balance](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) · [Trustlines](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines)

***

Immediate [#immediate]

The wallet is funded atomically at the moment the user logs in. Ready in under 3 seconds. No additional setup required.

**Cost:** \~2 XLM per registration, including users who abandon onboarding.

```tsx
const { login, isAuthenticated } = usePollar();
await login({ provider: 'google' });
// once isAuthenticated is true, the wallet is funded and ready immediately
```

***

Deferred [#deferred]

The G-address is created on-chain at registration but without an XLM reserve. The wallet exists but cannot transact until it is activated.

**Cost:** \~2 XLM only for users who complete activation. Zero cost for users who abandon.

This mode solves a problem unique to Stellar: every account needs a minimum XLM reserve to exist on-chain. Without deferred funding, an app with 10,000 users who abandon onboarding burns 20,000 XLM for nothing.

Activating via webhook [#activating-via-webhook]

Your backend calls `POST /v1/wallets/activate` when a business event occurs — KYC approved, first deposit, email verified, or any trigger you define.

```bash
POST https://api.pollar.xyz/v1/wallets/activate
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

> Never call this endpoint from the client. It requires your secret key and must run on your backend. See the [Server API](https://docs.pollar.xyz/docs/sdk-reference/server-api) reference.

**Response codes:**

| Code                      | Meaning                                        |
| ------------------------- | ---------------------------------------------- |
| `200 OK`                  | Wallet activated. XLM reserve funded on-chain. |
| `400 Bad Request`         | Missing or malformed `publicKey`.              |
| `402 Payment Required`    | Funding wallet has insufficient XLM.           |
| `404 Not Found`           | `publicKey` is not a wallet owned by your app. |
| `409 Conflict`            | Wallet is already funded. Safe to ignore.      |
| `503 Service Unavailable` | Stellar network issue.                         |

Funding manually from the Dashboard [#funding-manually-from-the-dashboard]

Any not-yet-funded wallet can be funded from **Dashboard → Users → Wallets** with the **Fund 2 XLM** action. This works in both Immediate and Deferred mode and is useful for support workflows or one-off overrides.

Checking whether a wallet is funded [#checking-whether-a-wallet-is-funded]

The funded state is reflected on-chain. From an authenticated session you can read the wallet's balances — an unfunded wallet has no XLM reserve yet:

```tsx
const { walletBalance, refreshWalletBalance } = usePollar();

await refreshWalletBalance();
if (walletBalance.step === 'loaded') {
  // inspect walletBalance.data.balances to see if the reserve / assets are present
}
```

***

Switching modes [#switching-modes]

You can switch funding modes at any time from the Dashboard without changing any code. The new mode applies to all wallets created after the switch. Existing wallets are not affected.

***

Cost comparison [#cost-comparison]

For an app with 10,000 registered users where 30% complete activation:

| Mode        | XLM spent        | Cost basis           |
| ----------- | ---------------- | -------------------- |
| Immediate   | \~20,000 XLM     | Every registration   |
| Deferred    | \~6,000 XLM      | Only activated users |
| **Savings** | **\~14,000 XLM** | <br />               |

The Dashboard shows a real-time cost breakdown per mode so you can optimize as your app grows.


# Security Model



Pollar manages private keys on behalf of your users and your app. This page explains exactly how keys are stored, who can access them, and how the system prevents unauthorized access.

***

Key management models [#key-management-models]

| Model                         | Who holds the key                                       | Status        |
| ----------------------------- | ------------------------------------------------------- | ------------- |
| **AWS KMS**                   | KMS — no Pollar employee can access keys silently       | Available     |
| **Passkeys (WebAuthn)**       | The user's device Secure Enclave — Pollar never sees it | `coming soon` |
| **BYOK (Bring Your Own KMS)** | Your own KMS instance — full operator control           | `coming soon` |
| **MPC**                       | No single actor holds the full key                      | `coming soon` |

***

AWS KMS [#aws-kms]

All private keys — user wallets and your app's sponsorship wallets (funding, gas, distribution) — are managed through AWS KMS using envelope encryption. No key is ever stored in plaintext anywhere in Pollar's infrastructure.

```
Private key (plaintext)
  └── Encrypted with a data key (AES-256-GCM)
        └── Data key encrypted by AWS KMS master key
              └── Master key never leaves AWS KMS hardware
```

**The flow for every signing operation:**

1. Pollar Server calls `KMS.generateDataKey()` at wallet creation
2. KMS returns a plaintext data key and an encrypted copy
3. Pollar Server encrypts the private key, then immediately discards the plaintext data key
4. Only ciphertext is stored in the database — useless without KMS access
5. To sign a transaction, Pollar Server calls `KMS.decrypt()`, decrypts the key in memory, signs, and discards

Every `KMS.decrypt()` call is logged to AWS CloudTrail with an immutable audit trail. No Pollar employee can access a key without leaving a permanent record.

***

Passkeys / WebAuthn `coming soon` [#passkeys--webauthn-coming-soon]

When Passkeys are enabled, the private key is generated on the user's device and stored in the **Secure Enclave** — the hardware security module built into iOS and Android devices.

```
Private key generated on device
  └── Stored in Secure Enclave (Face ID / Touch ID protected)
        └── Pollar never receives or stores the private key
              └── Transactions signed on-device — only the signature is sent to the server
```

Users authenticate with biometrics to sign transactions. Pollar has zero custody of the key.

**Account recovery (3 layers):**

| Layer | Mechanism                                                     | Covers             |
| ----- | ------------------------------------------------------------- | ------------------ |
| 1     | Native cloud sync (iCloud Keychain / Google Password Manager) | \~80% of cases     |
| 2     | Secondary Passkey registered on a backup device               | Multi-device users |
| 3     | Social re-keying via OAuth re-auth + Stellar `setOptions`     | Total device loss  |

***

BYOK — Bring Your Own KMS `coming soon` [#byok--bring-your-own-kms-coming-soon]

By default, Pollar manages the AWS KMS master keys. With BYOK, you configure your own KMS instance from the Dashboard — Pollar's server calls your KMS instead of its own.

For compliance requirements that mandate operator control over root encryption keys.

***

MPC — Multi-Party Computation `coming soon` [#mpc--multi-party-computation-coming-soon]

With MPC, the private key is split using Shamir Secret Sharing. No single actor — not Pollar, not the user, not your app — holds the complete key. Signing requires a threshold of parties to cooperate, enabling social recovery without any dependency on Pollar.

***

Pollar Server boundaries [#pollar-server-boundaries]

The Pollar Server is designed with minimum privileges:

| Operation                             | Allowed                                 |
| ------------------------------------- | --------------------------------------- |
| Sign fee-bump transactions            | Yes — to cover fees on behalf of users  |
| Execute account sponsorship sequences | Yes — to fund new wallets               |
| Move a user's own funds independently | **No**                                  |
| Access user private keys without KMS  | **No** — all keys are encrypted at rest |

Why the Pollar Server cannot move a user's own funds — technically [#why-the-pollar-server-cannot-move-a-users-own-funds--technically]

A fee-bump transaction has two layers: an inner transaction (signed by the user's key) and an outer wrapper (signed by the Pollar sponsor). The outer signature only authorizes paying the fee — it has no authority over the inner transaction's operations. Moving a user's funds requires a `payment` or `pathPayment` operation inside the inner transaction, which must be signed by the user's own private key. The sponsor keypair Pollar holds can never produce that signature.

In other words: Pollar's sponsor key is structurally limited to "I'll pay the fee for this transaction" — the contents of the transaction are entirely controlled by the user's key, which Pollar only accesses via KMS to sign operations the user initiates.

Operator wallets (funding, gas, distribution) [#operator-wallets-funding-gas-distribution]

These wallets are also managed via AWS KMS — Pollar holds the encrypted keys and signs on their behalf. The distinction from user wallets is that these are *your* wallets, funded by you, and exist specifically so Pollar can operate them for a defined set of tasks: funding XLM reserves, paying transaction fees, and distributing assets via distribution rules. Every signing operation is logged to AWS CloudTrail. Pollar cannot use these wallets outside of those operations, and no action goes unrecorded.

Fee-bump policy enforcement [#fee-bump-policy-enforcement]

Before signing any fee-bump, the Pollar Server validates:

* Fee does not exceed `max_fee_per_tx` configured in Dashboard
* User has not exceeded their `daily_ops_cap`
* Asset is in the app's `approved_assets` list
* Gas wallet balance is above the minimum reserve threshold

These rules are enforced server-side and cannot be bypassed from the client SDK.

***

Attack surface [#attack-surface]

| Vector                    | Risk                             | Mitigation                                                            |
| ------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| Database compromised      | Key exposure                     | Only ciphertext stored — useless without KMS                          |
| Insider threat            | Pollar employee accesses keys    | Every KMS decrypt logged to immutable CloudTrail                      |
| Pollar Server compromised | Unauthorized fee-bumps           | Sponsor keypair has fee-bump privileges only — cannot move user funds |
| Webhook spoofing          | Unauthorized wallet activations  | Secret key required — server-side validation                          |
| Client-side bypass        | SDK manipulated to skip policies | All policy enforcement is server-side                                 |
| Device loss (Passkeys)    | Passkey inaccessible             | Three-layer recovery                                                  |


# Stellar Primitives



Pollar is built on top of specific Stellar protocol features. You don't need to know Stellar deeply to use Pollar — but understanding these primitives helps you make better decisions about funding modes, security, and fiat ramps.

***

Account model [#account-model]

Stellar accounts are identified by a **G-address** (a public key starting with `G`). Every account must hold a minimum **XLM reserve** to exist on-chain — currently 1 XLM base reserve plus 0.5 XLM per entry (trustlines, offers, etc.).

This is different from EVM chains, where an address exists as soon as someone sends funds to it.

**What Pollar does:** Creates the G-address for your user and manages the XLM reserve on their behalf, so users never need to know what a reserve is or where to get XLM.

***

Fee-bump transactions [#fee-bump-transactions]

Every Stellar transaction requires a small XLM fee paid by the submitter. Without fee-bumps, users would need XLM before they can do anything — a problem for new users who have never held crypto.

Fee-bump transactions solve this: a third party (the sponsor) wraps the user's transaction and pays the fee on their behalf. The user's transaction is valid, the sponsor pays, and the user needs zero XLM.

**What Pollar does:** The Pollar Server maintains a sponsor keypair for your app. Every transaction submitted through the SDK is automatically wrapped in a fee-bump, paid from your app's gas wallet.

```
User transaction (inner tx)
└── Fee-bump wrapper (outer tx)
    └── Signed by Pollar sponsor
    └── Fee paid from your gas wallet
```

***

Account sponsorship [#account-sponsorship]

Beyond fee-bumps, Stellar has a native sponsorship model for account reserves. A sponsor can cover the XLM reserve of another account using `beginSponsoringFutureReserves` / `endSponsoringFutureReserves`.

This is what enables Pollar's Deferred mode: the G-address exists on-chain with no reserve until activation, at which point Pollar executes the sponsorship sequence atomically.

```
beginSponsoringFutureReserves(userAddress)
  createAccount(userAddress, startingBalance: 0)
  changeTrust(USDC, source: userAddress)
endSponsoringFutureReserves(source: userAddress)
```

If any operation fails, the entire transaction reverts — no partial states.

***

Trustlines [#trustlines]

In Stellar, an account must explicitly opt in to hold an asset by creating a **trustline**. Without a trustline for USDC, an account cannot receive or hold it.

**What Pollar does:** Automatically enables trustlines for all assets configured in your Dashboard at wallet creation or activation. If no assets are configured, no trustlines are set up. Users never see a trustline prompt.

***

SEP-10 — Stellar Web Authentication [#sep-10--stellar-web-authentication]

SEP-10 is a Stellar standard for authenticating ownership of a Stellar account using a challenge-response mechanism — no passwords, no email, just a signed Stellar transaction.

**What Pollar uses it for:** Authenticating operators in the Dashboard. When you sign in to `dashboard.pollar.xyz`, your Stellar wallet signs a challenge proving you own the account.

***

SEP-24 — Hosted Deposit and Withdrawal [#sep-24--hosted-deposit-and-withdrawal]

SEP-24 is a Stellar standard for fiat on/off-ramps. It defines a protocol between a wallet app and an **anchor** (a licensed financial institution) for depositing and withdrawing fiat currency in exchange for Stellar assets like USDC.

**What Pollar uses it for:** Embedding fiat deposit and withdrawal flows directly in your app via a modal. Activate SEP-24 with a single flag in the Dashboard.

***

SEP-7 — Payment Request URIs `coming soon` [#sep-7--payment-request-uris-coming-soon]

SEP-7 defines a URI scheme for Stellar payment requests — similar to Bitcoin's `bitcoin:` URIs. A SEP-7 URI encodes destination, asset, amount, and memo so any compatible wallet can pre-fill a payment form by scanning a QR code or opening a link.

**What Pollar will use it for:** The receive flow — QR codes and shareable payment links that work with any SEP-7 compatible Stellar wallet.

***

Quick reference [#quick-reference]

| Primitive               | Used in Pollar for                                 |
| ----------------------- | -------------------------------------------------- |
| G-address + XLM reserve | Wallet creation, funding modes                     |
| Fee-bump transactions   | Gas sponsorship — users pay zero XLM               |
| Account sponsorship     | Deferred funding mode and manual activation        |
| Trustlines              | Automatic asset enablement on activation           |
| SEP-10                  | Dashboard authentication                           |
| SEP-24                  | Fiat deposit and withdrawal                        |
| SEP-7                   | Receive QR codes and payment links (`coming soon`) |


# Transaction History



Pollar provides complete transaction history for every wallet through two complementary layers — one from the Stellar network and one from Pollar's own database.

***

Two-layer architecture [#two-layer-architecture]

<Mermaid
  chart="flowchart LR
    subgraph sources[&#x22;Data sources&#x22;]
        A(&#x22;Stellar RPC\nLast 7 days&#x22;):::stellar
        B(&#x22;Pollar PostgreSQL\nFull history&#x22;):::db
    end

    C(&#x22;Pollar Server&#x22;):::server
    D(&#x22;Your App\nSDK · REST API&#x22;):::app

    A -->|&#x22;recent txs&#x22;| C
    B -->|&#x22;full history&#x22;| C
    C -->|&#x22;merged, paginated&#x22;| D

    classDef stellar fill:#faeeda,stroke:#ba7517,color:#633806
    classDef db fill:#e6f1fb,stroke:#378add,color:#0c447c
    classDef server fill:#eeedfe,stroke:#7f77dd,color:#3c3489
    classDef app fill:#e1f5ee,stroke:#1d9e75,color:#085041"
/>

| Layer  | Source            | Retention  |
| ------ | ----------------- | ---------- |
| Recent | Stellar RPC       | 7 days     |
| Full   | Pollar PostgreSQL | Indefinite |

The Pollar Server captures every transaction at fee-bump signing time and persists it to PostgreSQL. Because Pollar processes all fee-bumps for your app, it has full visibility without indexing the entire blockchain.

> Horizon (the older Stellar API) is formally deprecated by SDF. Pollar uses Stellar RPC exclusively.

***

SDK — React hook [#sdk--react-hook]

`txHistory` is a reactive state machine (`TxHistoryState`). Trigger a load with `fetchTxHistory()` on the underlying client; the provider keeps `txHistory` in sync.

```tsx
'use client';
import { useEffect } from 'react';
import { usePollar } from '@pollar/react';

export function TxHistory() {
  const { txHistory, getClient } = usePollar();

  useEffect(() => {
    getClient().fetchTxHistory({ limit: 20, offset: 0 });
  }, [getClient]);

  if (txHistory.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {txHistory.data.records.map((tx) => (
        <li key={tx.id}>
          {tx.summary} · {tx.status} · {new Date(tx.createdAt).toLocaleDateString()}
        </li>
      ))}
    </ul>
  );
}
```

> The simplest path is the built-in modal: call `openTxHistoryModal()` from `usePollar()`.

SDK — Core client [#sdk--core-client]

```typescript
await pollar.fetchTxHistory({ limit: 20, offset: 0 });

const state = pollar.getTxHistoryState();
if (state.step === 'loaded') {
  console.log(state.data.records, state.data.total);
}
```

`fetchTxHistory` drives `TxHistoryState` (it does not return the records directly). Subscribe with `onTxHistoryStateChange` for updates.

***

REST API [#rest-api]

The end-user transaction history is served by the SDK API (publishable key + authenticated end-user session), not by the secret-key Server API:

```bash
GET https://sdk.api.pollar.xyz/v1/tx/history?limit=20&offset=0
```

> There is currently **no secret-key Server API endpoint** for wallet transaction history. Use the SDK (`fetchTxHistory`) from an authenticated session.

**Query parameters:**

| Parameter | Type     | Default | Description             |
| --------- | -------- | ------- | ----------------------- |
| `limit`   | `number` | —       | Records per page.       |
| `offset`  | `number` | `0`     | Offset for pagination.  |
| `network` | `string` | session | `testnet` or `mainnet`. |

**Response (`content`):**

```json
{
  "records": [
    {
      "id": "tx_abc123",
      "hash": "a1b2c3d4...",
      "network": "testnet",
      "status": "SUCCESS",
      "operation": "payment",
      "feeXlm": "0.00001",
      "summary": "Sent 10.00 USDC",
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

***

Pagination [#pagination]

History uses **offset-based** pagination. Increase `offset` by `limit` to page forward; `total` tells you when to stop.

```typescript
async function getAllTransactions() {
  const all = [];
  let offset = 0;
  const limit = 100;

  for (;;) {
    await pollar.fetchTxHistory({ limit, offset });
    const state = pollar.getTxHistoryState();
    if (state.step !== 'loaded') break;
    all.push(...state.data.records);
    offset += limit;
    if (offset >= state.data.total) break;
  }

  return all;
}
```

***

Transaction status [#transaction-status]

Each record carries a `status` reflecting its lifecycle:

| Status    | Description                                  |
| --------- | -------------------------------------------- |
| `PENDING` | Built/submitted, not yet confirmed on-chain. |
| `SUCCESS` | Confirmed on-chain.                          |
| `FAILED`  | Rejected by Stellar.                         |

The human-readable `operation` and `summary` fields describe what the transaction did.

***

Record type [#record-type]

```typescript
type TxHistoryRecord = {
  id: string;
  hash: string;
  network: 'testnet' | 'mainnet';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  operation: string;
  feeXlm?: string;
  resultCode?: string;
  summary: string;
  createdAt: string; // ISO 8601
};
```


# API Keys



***

Pollar issues two types of keys per environment. Understanding the difference is important before writing any code.

***

Key types [#key-types]

| Type        | Prefix         | Network | Use                                     |
| ----------- | -------------- | ------- | --------------------------------------- |
| Publishable | `pub_testnet_` | Testnet | Frontend only (safe to expose)          |
| Publishable | `pub_mainnet_` | Mainnet | Frontend only (safe to expose)          |
| Secret      | `sec_testnet_` | Testnet | Backend only (never expose client-side) |
| Secret      | `sec_mainnet_` | Mainnet | Backend only (never expose client-side) |

The **publishable key** is passed to `@pollar/core` or `@pollar/react` in your frontend. The **secret key** stays on your backend and is used for privileged operations like triggering wallet activation via `POST /v1/wallets/activate`.

> For details on Stellar networks (Testnet vs Mainnet) see the [Stellar Networks docs](https://developers.stellar.org/docs/networks).

***

Generating a key [#generating-a-key]

1. Go to [dashboard.pollar.xyz](https://dashboard.pollar.xyz) and sign in with Google, GitHub, or email OTP
2. Navigate to **Build → API Keys → Generate**
3. Select the key type and network
4. Copy and store it securely — secret keys are only shown once

Start with `pub_testnet_` for development. Switch to `pub_mainnet_` when ready for production.

> **Testnet rate limit:** Testnet keys are limited to 1,000 requests per day. This is enough for active development — if you hit the limit, wait until the next UTC day or [contact us](mailto:hello@pollar.xyz) for a temporary increase.

***

Environment variables [#environment-variables]

Store keys in environment variables — never hardcode them or commit them to version control.

Next.js [#nextjs]

```bash
# .env.local
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx
POLLAR_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`NEXT_PUBLIC_` prefix makes the publishable key available client-side. Never apply this prefix to the secret key.

Vite / CRA [#vite--cra]

```bash
# .env.local
VITE_POLLAR_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx
POLLAR_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`VITE_` prefix exposes the variable to the browser bundle. Never apply it to the secret key.

***

Security rules [#security-rules]

* The publishable key is safe to expose in frontend code — it can only initiate user-authenticated operations

* The secret key must never appear in client-side code, browser bundles, or public repositories

* For mainnet, use build-time environment injection or a backend proxy — never hardcode `pub_mainnet_` in source

* Rotate a compromised key immediately from **Dashboard → Build → API Keys**


# Example App



A fully working Next.js demo that shows Pollar's complete onboarding-to-payment flow. Clone it, run it in under 5 minutes, and use it as a starting point for your own integration

**Repository:** [https://github.com/pollar-xyz/demo-nextjs](https://github.com/pollar-xyz/demo-nextjs)

***

What it demonstrates [#what-it-demonstrates]

| Feature                        | Description                                                                                                                         | Status        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Social login                   | Google, GitHub, and email OTP via `usePollar().login()`                                                                             | ✓             |
| Wallet creation                | Stellar G-address created and encrypted with AWS KMS on login                                                                       | ✓             |
| Deferred mode — KYC simulation | A button triggers a Next.js API route that calls `POST /v1/wallets/activate` with the secret key, simulating a backend KYC approval | ✓             |
| Send USDC                      | Transfer USDC to any Stellar address with zero fee UX                                                                               | ✓             |
| Receive                        | QR code (SEP-7 format) and shareable payment link                                                                                   | `coming soon` |
| Transaction history            | Full paginated history via `txHistory` hook                                                                                         | ✓             |
| Testnet funding                | Claimable distribution rules from the distribution wallet                                                                           | `coming soon` |
| Passkeys                       | Biometric auth with Face ID / Touch ID                                                                                              | `coming soon` |
| SEP-24 fiat deposit            | Fiat on-ramp via Anclap testnet                                                                                                     | `coming soon` |

***

Live demo [#live-demo]

[demo-nextjs.pollar.xyz](https://demo-nextjs.pollar.xyz) — runs on Stellar testnet. Complete a full onboarding flow and test every feature without touching mainnet funds.

***

Run locally [#run-locally]

```bash
git clone https://github.com/pollar-xyz/demo-nextjs
cd template-nextjs
npm install
cp .env.example .env.local
```

Add your keys to `.env.local`:

```bash
# Publishable — used in the frontend
NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY=pub_testnet_xxxxxxxxxxxxxxxxxxxx

# Secret — used only in API routes, never exposed to the browser
POLLAR_SECRET_KEY=sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

***

App structure [#app-structure]

```
template-nextjs/
├── app/
│   ├── layout.tsx              # PollarProvider wraps the app
│   ├── page.tsx                # Route: login vs wallet view
│   │
│   ├── api/
│   │   └── activate/
│   │       └── route.ts        # POST /api/activate — calls Pollar Server with secret key
│   │
│   └── components/
│       ├── LoginButton.tsx     # OAuth + email OTP
│       ├── WalletCard.tsx      # Balance and address display
│       ├── SendPaymentForm.tsx # runTx('payment', ...)
│       ├── ReceiveView.tsx     # QR code + shareable link
│       ├── TxHistoryList.tsx   # txHistory hook
│       └── KycGate.tsx         # Calls /api/activate to simulate KYC approval
│
├── .env.example
└── package.json
```

***

Key patterns [#key-patterns]

Provider setup [#provider-setup]

```tsx
// app/layout.tsx
import { PollarProvider } from '@pollar/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PollarProvider client={{ apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY! }}>
          {children}
        </PollarProvider>
      </body>
    </html>
  );
}
```

Deferred mode — KYC simulation [#deferred-mode--kyc-simulation]

The demo includes a Next.js API route that simulates a KYC provider calling your backend after a user is verified. The frontend calls this route — the route calls Pollar's `POST /v1/wallets/activate` using the secret key server-side. The endpoint authenticates with the `x-pollar-api-key` header and takes the wallet's `publicKey` (its `G…` address).

```ts
// app/api/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { publicKey } = await req.json();

  const response = await fetch('https://api.pollar.xyz/v1/wallets/activate', {
    method: 'POST',
    headers: {
      'x-pollar-api-key': process.env.POLLAR_SECRET_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(error, { status: response.status });
  }

  return NextResponse.json({ activated: true });
}
```

The frontend `KycGate` component calls this route — the secret key never leaves the server:

```tsx
// app/components/KycGate.tsx
'use client';
import { usePollar } from '@pollar/react';

export function KycGate() {
  const { isAuthenticated, wallet } = usePollar();

  if (!isAuthenticated) return null;

  async function handleActivate() {
    await fetch('/api/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicKey: wallet?.address }),
    });
  }

  return (
    <div>
      <p>Complete identity verification to activate your wallet.</p>
      <button onClick={handleActivate}>
        Simulate KYC approval
      </button>
    </div>
  );
}
```

In a real app, `/api/activate` would be called by your KYC provider's webhook — not by a button in the UI. See [Deferred Flow Guide](https://docs.pollar.xyz/docs/guides/deferred-flow-guide) for the full production setup.

Distribution — claiming assets `coming soon` [#distribution--claiming-assets-coming-soon]

> An app-initiated push helper (`fund()`) is **not available yet**. Today, distribution works through **claimable rules**: you configure rules under **Treasury → Token Distribution**, and users claim them from the SDK.

The available flow uses the distribution-rules modal and client methods exposed by `usePollar()` / `@pollar/core`:

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function ClaimButton() {
  const { openDistributionRulesModal } = usePollar();

  return (
    <button onClick={openDistributionRulesModal}>
      Claim tokens
    </button>
  );
}
```

For headless control, use `getClient().listDistributionRules()` and `getClient().claimDistributionRule(...)`. Configured assets, amounts, and rate limits (per claim / period) are set per asset under **Treasury → Token Distribution**, which debits the app's **distribution wallet** — separate from the funding and gas wallets.

Receive — QR code and shareable link [#receive--qr-code-and-shareable-link]

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function ReceiveView() {
  const { wallet } = usePollar();

  // coming soon: SEP-7 payment request URI
  // web+stellar:pay?destination=GXXX&asset_code=USDC&asset_issuer=GXXX
  const paymentLink = `https://pay.pollar.xyz/${wallet?.address}`;

  return (
    <div>
      {/* QR code component renders wallet.address */}
      <QRCode value={paymentLink} />
      <button onClick={() => navigator.clipboard.writeText(paymentLink)}>
        Copy payment link
      </button>
    </div>
  );
}
```

The QR code currently encodes the user's G-address as a payment link. SEP-7 support (which allows pre-filling asset, amount, and memo in any compatible Stellar wallet) is coming soon. The simplest path is the built-in `openReceiveModal()`.

***

Funding modes in the demo [#funding-modes-in-the-demo]

Switch from **Dashboard → Treasury → Funding Mode** — no code changes needed.

| Mode          | Behavior in the demo                                      |
| ------------- | --------------------------------------------------------- |
| **Immediate** | Wallet funded on login. KYC gate hidden.                  |
| **Deferred**  | Wallet unfunded until "Simulate KYC approval" is clicked. |

> A wallet in either mode can always be funded manually from **Users → Wallets** (the **Fund 2 XLM** action on not-yet-funded wallets).

***

Other templates [#other-templates]

| Template            | Repository                                                                  |
| ------------------- | --------------------------------------------------------------------------- |
| Next.js             | [pollar-xyz/template-nextjs](https://github.com/pollar-xyz/template-nextjs) |
| Expo / React Native | `coming soon`                                                               |
| TrueLayer           | `coming soon`                                                               |

***

Deploy [#deploy]

```bash
npx vercel
```

Set `NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY` and `POLLAR_SECRET_KEY` in Vercel environment variables. The secret key is used only in API routes and is never exposed to the browser.


# Overview



**Pollar** is the onboarding-to-payment infrastructure layer for consumer apps on Stellar. The full stack that takes a new user from clicking **Continue with Google** to sending USDC — without ever showing them a seed phrase, a wallet address, a transaction fee, or a trustline prompt.

***

The problem [#the-problem]

Every team building a consumer product on Stellar hits the same infrastructure wall before writing a single line of their actual product:

* Creating or linking a Stellar account for each user

* Handling XLM reserve funding

* Configuring trustlines for each asset

* Abstracting transaction fees from users unfamiliar with blockchain

* Building an onboarding flow that works for people with zero crypto experience

Pollar handles all of this so you can skip straight to building your product.

***

The solution [#the-solution]

```tsx
import { PollarProvider, usePollar } from '@pollar/react';

function App() {
  const { isAuthenticated, login, runTx } = usePollar();

  if (!isAuthenticated) {
    return (
      <button onClick={() => login({ provider: 'google' })}>
        Continue with Google
      </button>
    );
  }

  return (
    <button
      onClick={() =>
        runTx('payment', {
          destination: 'GXXX...',
          amount: '10',
          asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' },
        })
      }
    >
      Send 10 USDC
    </button>
  );
}

export default function Root() {
  return (
    <PollarProvider client={{ apiKey: 'pub_testnet_...' }}>
      <App />
    </PollarProvider>
  );
}
```

In a handful of lines: OAuth authentication, a funded Stellar wallet, and USDC payments. No seed phrases. No fee prompts. No trustline configuration. (`runTx` is the one-shot build → sign → submit helper; see the [SDK Reference](https://docs.pollar.xyz/docs/sdk-reference/pollar-react) for the split `buildTx` / `signAndSubmitTx` flow.)

***

How it compares [#how-it-compares]

| <br />                | Crossmint       | Privy | Dynamic | Stellar Wallets Kit  | **Pollar**       |
| --------------------- | --------------- | ----- | ------- | -------------------- | ---------------- |
| Stellar native        | Partial         | No    | No      | Yes (connector only) | **Yes**          |
| Deferred funding      | No              | N/A   | N/A     | No                   | **Yes (unique)** |
| Fee-bump native       | No              | N/A   | N/A     | No                   | **Yes**          |
| Built for startups    | No (enterprise) | Yes   | Yes     | Partial              | **Yes**          |
| Full onboarding stack | No              | No    | No      | No                   | **Yes**          |

> Pollar also **integrates** with several of these: first-party adapters let you use Privy embedded wallets or any Stellar Wallets Kit wallet as a login method on top of Pollar's stack. See [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters).


# Quickstart



Get from zero to a working Stellar wallet with USDC payments in under 10 minutes.

**Requirements:** Node.js 20+ · React 18+ · A publishable key from [dashboard.pollar.xyz](https://dashboard.pollar.xyz)

> SDK requests are rate-limited per API key — plenty of headroom for development. See [API Keys](https://docs.pollar.xyz/docs/getting-started/api-keys).

***

1\. Install [#1-install]

```bash
npm install @pollar/react
```

This includes `@pollar/core` as a peer dependency. If you are not using React:

```bash
npm install @pollar/core
```

***

2\. Add `PollarProvider` [#2-add-pollarprovider]

Wrap your app root once. Every child component can then call `usePollar()`.

```tsx
import { PollarProvider } from '@pollar/react';

export default function Root() {
  return (
    <PollarProvider client={{ apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY! }}>
      <App />
    </PollarProvider>
  );
}
```

`PollarProvider` already includes `"use client"` internally. Components that call `usePollar()` need `"use client"` because they use React hooks — that is a React requirement, not specific to Pollar.

Options [#options]

The `client` prop accepts either a `PollarClientConfig` (the provider builds the client for you) or a pre-built `PollarClient` instance.

| Prop        | Type                                 | Default | Description                                             |
| ----------- | ------------------------------------ | ------- | ------------------------------------------------------- |
| `client`    | `PollarClientConfig \| PollarClient` | —       | **Required.** Client config (`{ apiKey }`) or instance. |
| `appConfig` | `PollarConfig`                       | —       | Local override of the remote dashboard config/styles.   |

See [`@pollar/react`](https://docs.pollar.xyz/docs/sdk-reference/pollar-react) for the full prop list (`appConfig`, `adapters`, `onStorageDegrade`).

Not using React? [#not-using-react]

```typescript
import { PollarClient } from '@pollar/core';

const pollar = new PollarClient({
  apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY!,
  stellarNetwork: 'testnet',
});
```

***

3\. Login and create a wallet [#3-login-and-create-a-wallet]

```tsx
'use client';

import { usePollar } from '@pollar/react';

export function LoginButton() {
  const { isAuthenticated, wallet, login } = usePollar();

  if (isAuthenticated) return <p>✓ Wallet ready — {wallet?.address}</p>;

  return (
    <button onClick={() => login({ provider: 'google' })}>
      Continue with Google
    </button>
  );
}
```

When `login()` is called, Pollar:

1. Authenticates the user via OAuth (Google or GitHub) or email OTP
2. Creates a Stellar G-address on-chain
3. Encrypts the private key with AWS KMS
4. Enables trustlines for all assets configured in your Dashboard (if none configured, no trustlines are set up)
5. Funds the wallet based on your configured [funding mode](https://docs.pollar.xyz/docs/core-concepts/funding-modes)

The user never sees a seed phrase, a wallet address, or a trustline prompt.

***

4\. Send USDC [#4-send-usdc]

```tsx
'use client';

import { usePollar } from '@pollar/react';

export function SendButton() {
  const { runTx } = usePollar();

  return (
    <button
      onClick={() =>
        runTx('payment', {
          destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          amount: '10.00',
          asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' },
        })
      }
    >
      Send 10 USDC
    </button>
  );
}
```

`runTx(operation, params)` is the one-shot helper that builds, signs, and submits in a single call (alias of `buildAndSignAndSubmitTx`). For step-by-step control — and to drive the transaction modal UI — use `buildTx()` then `signAndSubmitTx()`; see [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core). For a native XLM payment use `asset: { type: 'native' }`.

Transaction fees are paid from your app's sponsorship wallet configured in the Dashboard. Users pay zero XLM.

***

5\. Transaction history [#5-transaction-history]

```tsx
'use client';

import { usePollar } from '@pollar/react';

import { useEffect } from 'react';

export function History() {
  const { txHistory, getClient } = usePollar();

  // `txHistory` is a state machine; trigger a fetch on the underlying client.
  useEffect(() => {
    getClient().fetchTxHistory({ limit: 20 });
  }, [getClient]);

  if (txHistory.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {txHistory.data.records.map((tx) => (
        <li key={tx.id}>
          {tx.summary} · {tx.status}
        </li>
      ))}
    </ul>
  );
}
```

> The simplest path is the built-in modal: call `openTxHistoryModal()` from `usePollar()` and Pollar renders the list for you — no state wiring needed.

***

Complete example [#complete-example]

```tsx
'use client';

import { PollarProvider, usePollar } from '@pollar/react';

function WalletDemo() {
  const { isAuthenticated, wallet, login, runTx, openTxHistoryModal } = usePollar();

  if (!isAuthenticated) {
    return (
      <button onClick={() => login({ provider: 'google' })}>
        Continue with Google
      </button>
    );
  }

  return (
    <div>
      <p>✓ Wallet active — {wallet?.address}</p>
      <button
        onClick={() =>
          runTx('payment', {
            destination: 'GXXX...',
            amount: '5.00',
            asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' },
          })
        }
      >
        Send 5 USDC
      </button>
      <button onClick={openTxHistoryModal}>History</button>
    </div>
  );
}

export default function App() {
  return (
    <PollarProvider client={{ apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY! }}>
      <WalletDemo />
    </PollarProvider>
  );
}
```

***

> Both `@pollar/core` and `@pollar/react` ship with full TypeScript types — no `@types/` package needed.


# Deferred Flow Guide



Deferred mode creates user wallets on-chain without funding them immediately. The XLM reserve is only charged when your backend calls `POST /v1/wallets/activate` — typically after a business event like KYC approval or a first deposit.

This guide walks through the full implementation end-to-end.

***

Prerequisites [#prerequisites]

* Funding mode set to **Deferred** in **Dashboard → Treasury → Funding Mode**
* A secret key from **Dashboard → Build → API Keys**
* That's it — no additional dashboard configuration required

***

How it works [#how-it-works]

<Mermaid
  chart="sequenceDiagram
    participant User
    participant Frontend as Your Frontend
    participant Backend as Your Backend
    participant Pollar as Pollar Server
    participant Stellar as Stellar Network

    User->>Frontend: login()
    Frontend->>Pollar: login (creates G-address, no reserve)
    Pollar->>Stellar: createAccount (no reserve)
    Pollar-->>Frontend: authenticated (wallet unfunded)
    Frontend-->>User: Show KYC flow

    Note over User,Backend: User completes KYC / first deposit / your trigger

    Backend->>Pollar: POST /v1/wallets/activate
    Note over Backend,Pollar: Uses secret key — never from client
    Pollar->>Stellar: beginSponsoringFutureReserves
    Stellar-->>Pollar: Reserve funded (~2s)
    Pollar-->>Backend: 200 { status: 'active' }
    Frontend-->>User: Wallet ready"
/>

***

Step 1 — Gate unfunded wallets in the frontend [#step-1--gate-unfunded-wallets-in-the-frontend]

After login, decide whether to show your KYC/onboarding flow or the wallet UI. In Deferred mode the wallet exists but has no XLM reserve until activated — pass the user's `wallet.address` (their `G…` public key) to your KYC flow so your backend can activate it later.

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function WalletGate() {
  const { isAuthenticated, wallet } = usePollar();

  if (!isAuthenticated) return <LoginButton />;

  // Track "has this user completed your business trigger?" in your own backend.
  // Until then, show the KYC/onboarding flow.
  return <KycFlow publicKey={wallet?.address} />;
}
```

***

Step 2 — Trigger activation from your backend [#step-2--trigger-activation-from-your-backend]

When the business event occurs (KYC approved, first deposit confirmed, etc.), your backend calls `POST /v1/wallets/activate` using the **secret key** and the wallet's `publicKey`.

```typescript
// Your backend — e.g. Next.js API route, Express handler, webhook receiver
async function activateWallet(publicKey: string) {
  const response = await fetch('https://api.pollar.xyz/v1/wallets/activate', {
    method: 'POST',
    headers: {
      'x-pollar-api-key': process.env.POLLAR_SECRET_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey }),
  });

  if (!response.ok) {
    const { code } = await response.json(); // { code, success: false }
    throw new Error(`Activation failed: ${code}`);
  }

  return response.json();
  // { content: { publicKey, amount }, code: 'SERVER_WALLET_ACTIVATED', success: true }
}
```

> Never call this endpoint from the client. It requires your secret key — exposing it client-side compromises your entire app.

***

Step 3 — Handle the response [#step-3--handle-the-response]

| Code                      | Meaning                                       | Action                                                |
| ------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `200 OK`                  | Wallet activated successfully                 | Proceed — wallet is funded on-chain                   |
| `400 Bad Request`         | Missing or malformed `publicKey`              | Check the request payload                             |
| `402 Payment Required`    | Funding wallet has insufficient XLM           | Top up via **Dashboard → Treasury → Account Funding** |
| `404 Not Found`           | `publicKey` is not a wallet owned by your app | Verify the public key                                 |
| `409 Conflict`            | Wallet already funded                         | Safe to ignore — treat as success                     |
| `503 Service Unavailable` | Stellar network issue                         | Pollar retries automatically                          |

***

Step 4 — Notify the frontend [#step-4--notify-the-frontend]

After activation, notify your frontend so the UI updates. Your backend owns the "is this user activated?" signal, so the simplest approach is to poll your own endpoint; you can confirm on-chain by refreshing the wallet balance (an activated wallet now has its XLM reserve).

```tsx
'use client';
import { usePollar } from '@pollar/react';
import { useEffect, useState } from 'react';

export function KycFlow({ publicKey }: { publicKey: string }) {
  const { refreshWalletBalance, walletBalance } = usePollar();
  const [activated, setActivated] = useState(false);

  // Poll your own backend for the activation result, then refresh on-chain state.
  useEffect(() => {
    if (activated) return;
    const interval = setInterval(async () => {
      const done = await fetch('/api/activation-status').then(r => r.json());
      if (done.activated) {
        setActivated(true);
        await refreshWalletBalance();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [activated, refreshWalletBalance]);

  if (activated && walletBalance.step === 'loaded') {
    return <p>✓ Wallet activated</p>;
  }

  return <p>Complete KYC to activate your wallet...</p>;
}
```

***

Full Next.js example [#full-nextjs-example]

The [template-nextjs](https://github.com/pollar-xyz/template-nextjs) demo includes a working implementation:

* `app/api/activate/route.ts` — the API route that calls `POST /v1/wallets/activate`
* `app/components/KycGate.tsx` — the frontend component that triggers it

***

Testing on testnet [#testing-on-testnet]

1. Set funding mode to **Deferred** in the Dashboard
2. Log in — the wallet is created unfunded (no XLM reserve)
3. Call your activate endpoint manually (e.g. with curl or Postman)
4. Verify the wallet is now funded (it has its XLM reserve)
5. Verify the G-address on [Stellar Expert testnet](https://testnet.stellar.expert)

```bash
curl -X POST https://api.pollar.xyz/v1/wallets/activate \
  -H "x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{ "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }'
```


# Mainnet Checklist



Before switching your app to Mainnet, verify every item in this checklist. There are no approval requirements from Pollar — this is a technical checklist you verify independently.

***

Dashboard configuration [#dashboard-configuration]

* [ ] Created a separate Mainnet app in the Dashboard (do not reuse your Testnet app)

* [ ] Generated `pub_mainnet_` and `sec_mainnet_` keys

* [ ] Added your production domain(s) in **Dashboard → Build → Domains**

* [ ] Funding mode configured correctly for your use case

* [ ] At least one asset configured in **Tokens / Trustlines**

* [ ] Branding & UI configured with your production logo and colors

***

App Wallets [#app-wallets]

* [ ] Funding wallet active on Stellar Mainnet with sufficient XLM
  * Recommended minimum: 50 XLM to start

  * Calculate based on expected activations: `activations × (1 + assets × 0.5) XLM`

* [ ] Gas wallet active and funded
  * Recommended minimum: 10 XLM

* [ ] Distribution wallet funded (if distributing tokens)

* [ ] Low-balance alerts configured in **Dashboard → Monitor → Alerts**
  * At minimum: email alert for funding wallet below 20 XLM

***

Environment variables [#environment-variables]

* [ ] `pub_mainnet_` key set in your production environment

* [ ] `sec_mainnet_` key set in your backend production environment

* [ ] No testnet keys present in production environment variables

* [ ] Keys not committed to version control

***

Backend (Deferred mode only) [#backend-deferred-mode-only]

* [ ] `POST /v1/wallets/activate` endpoint deployed to production

* [ ] Endpoint uses `sec_mainnet_` secret key

* [ ] Endpoint validates input before calling Pollar

* [ ] `409 Conflict` response handled as success (wallet already active)

* [ ] `402 Payment Required` triggers an alert — your funding wallet needs a top-up

***

SDK integration [#sdk-integration]

* [ ] `PollarProvider` uses production publishable key (`client={{ apiKey: 'pub_mainnet_...' }}`)

* [ ] No hardcoded testnet addresses or amounts

* [ ] Error handling implemented for transaction (`runTx` / `signAndSubmitTx`) failures — inspect the returned `SubmitOutcome.status`

* [ ] Unfunded wallets handled in the UI (Deferred mode — wallet exists but not yet activated)

* [ ] Token distribution rules configured in Dashboard if used

***

Testing [#testing]

* [ ] Full onboarding flow tested end-to-end on Mainnet with a real user account

* [ ] At least one real USDC payment sent and confirmed

* [ ] Transaction appears in **Dashboard → Monitor → Transactions**

* [ ] Wallet visible on [Stellar Expert](https://stellar.expert)

* [ ] Webhook events received correctly (if configured)

***

Observability [#observability]

* [ ] **Dashboard → Monitor → Logs** monitored after first real users

* [ ] Error alerting set up (Sentry, Datadog, or similar) for your backend

* [ ] Sponsorship wallet balances checked after first day of real usage

***

Stellar network reference [#stellar-network-reference]

* Mainnet passphrase: `Public Global Stellar Network ; September 2015`

* Mainnet Stellar Expert: [stellar.expert](https://stellar.expert)

* Network status: [status.stellar.org](https://status.stellar.org)

> Full network details at [developers.stellar.org/docs/networks](https://developers.stellar.org/docs/networks).


# Passkeys Guide `coming soon`



Passkeys let your users sign transactions with Face ID or Touch ID instead of a password or seed phrase. The private key is generated and stored in the device's Secure Enclave — Pollar never sees it.

***

How it works [#how-it-works]

With the default AWS KMS model, Pollar encrypts and manages the user's private key server-side. When a user enables a Passkey, the key migrates from KMS to their device's Secure Enclave:

```
Before Passkeys (KMS model)
  Private key → encrypted with AWS KMS → stored server-side
  Signing → Pollar Server decrypts key → signs → discards

After Passkeys (WebAuthn model)
  Private key → generated on device → stored in Secure Enclave
  Signing → user authenticates with Face ID / Touch ID → device signs locally
  Pollar receives only the signature — never the key
```

This means Pollar has zero custody of the key after Passkey setup. No KMS call, no audit trail needed — the key never touches Pollar infrastructure.

***

User flow [#user-flow]

1. User logs in with Google, GitHub, or email OTP as usual
2. After login, your app prompts: &#x2A;*"Enable Face ID for faster sign-in"**
3. User taps the button — device generates a keypair in the Secure Enclave
4. Pollar updates the wallet to use the new Passkey-backed key
5. All future transaction signatures happen on-device via biometrics

***

Implementation `coming soon` [#implementation-coming-soon]

> Partial support has already landed: `@pollar/core` exposes `PollarClient.loginSmartWallet()` and a `passkey` config slot (on web the provider injects a browser passkey ceremony automatically), and `@pollar/react` now depends on `@simplewebauthn/browser`. The high-level `usePollarPasskey()` hook shown below is still the planned ergonomic wrapper and is **not exported yet**.

```tsx
'use client';
import { usePollarPasskey } from '@pollar/react';

export function PasskeySetup() {
  const { setupPasskey, passkeyStatus, loading } = usePollarPasskey();

  if (passkeyStatus === 'active') {
    return <p>✓ Face ID / Touch ID active</p>;
  }

  return (
    <button onClick={() => setupPasskey()} disabled={loading}>
      Enable Face ID
    </button>
  );
}
```

`setupPasskey()` triggers the WebAuthn registration flow:

1. Pollar Server generates a challenge
2. Device's Secure Enclave signs the challenge with a new keypair
3. Public key is sent to Pollar Server and associated with the wallet
4. Private key never leaves the device

***

Account recovery [#account-recovery]

If the user loses their device, Pollar provides three recovery layers:

| Layer | Mechanism                                                     | Covers             |
| ----- | ------------------------------------------------------------- | ------------------ |
| 1     | Native cloud sync (iCloud Keychain / Google Password Manager) | \~80% of cases     |
| 2     | Secondary Passkey registered on a backup device               | Multi-device users |
| 3     | Social re-keying via OAuth re-auth + Stellar `setOptions`     | Total device loss  |

***

Security properties [#security-properties]

| Property                    | KMS model             | Passkeys model     |
| --------------------------- | --------------------- | ------------------ |
| Key stored server-side      | Yes (encrypted)       | No                 |
| Pollar can access key       | With CloudTrail audit | Never              |
| Requires biometrics to sign | No                    | Yes                |
| Works offline               | No                    | Yes (signing only) |
| Recovery if device lost     | N/A                   | 3-layer recovery   |

***

Browser and device support [#browser-and-device-support]

WebAuthn (the underlying standard) is supported on:

* iOS 16+ (Face ID, Touch ID)
* Android 9+ (fingerprint, face unlock)
* macOS with Touch ID
* Windows Hello
* Any device with a FIDO2 hardware key

***

Enabling Passkeys for your app [#enabling-passkeys-for-your-app]

When available, Passkeys can be enabled per-app from **Dashboard → Build → Settings → Key Management**. The feature is opt-in — existing users are not affected until they set up a Passkey themselves.


# Payments UI



This guide covers how to implement send, receive, and transaction history flows in your app using Pollar's hooks and pre-built components.

***

All payment functionality is exposed through the single `usePollar()` hook.

Send [#send]

Using `runTx('payment', ...)` [#using-runtxpayment-]

`runTx` is the one-shot helper (build → sign → submit). The returned `SubmitOutcome` has a `status` of `'success'`, `'pending'`, or `'error'`.

```tsx
'use client';
import { usePollar } from '@pollar/react';
import { useState } from 'react';

const USDC = { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5Z...' } as const;

export function SendForm() {
  const { runTx, tx } = usePollar();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const sending = tx.step !== 'idle' && tx.step !== 'success' && tx.step !== 'error';

  async function handleSend() {
    const result = await runTx('payment', { destination: to, amount, asset: USDC });
    if (result.status === 'success') console.log('Confirmed:', result.hash);
  }

  return (
    <div>
      <input
        placeholder="Recipient G-address"
        value={to}
        onChange={e => setTo(e.target.value)}
      />
      <input
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button onClick={handleSend} disabled={sending}>
        {sending ? 'Sending...' : 'Send USDC'}
      </button>
    </div>
  );
}
```

For a native XLM payment, use `asset: { type: 'native' }`. For step-by-step control over building and signing, use `buildTx()` then `signAndSubmitTx()` — see [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core).

With memo [#with-memo]

Memos are useful for identifying payments on the recipient's side — common in remittance and payroll apps. Pass a `memo` in the third `options` argument:

```tsx
await runTx(
  'payment',
  { destination: 'GXXX...', amount: '100.00', asset: USDC },
  { memo: { type: 'text', value: 'Payroll March 2026' } },
);
```

Pre-built send modal [#pre-built-send-modal]

Pollar ships a ready-made send flow (address input, asset selector, amount field, confirmation). Open it programmatically — appearance is customizable from **Build → Branding**:

```tsx
const { openSendModal } = usePollar();
// ...
<button onClick={openSendModal}>Send</button>
```

***

Receive [#receive]

Showing the user's address [#showing-the-users-address]

The authenticated wallet is exposed as `wallet` — read its on-chain address from `wallet.address`:

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function ReceiveView() {
  const { wallet } = usePollar();

  async function copyAddress() {
    if (wallet) await navigator.clipboard.writeText(wallet.address);
  }

  return (
    <div>
      <p>{wallet?.address}</p>
      <button onClick={copyAddress}>Copy address</button>
    </div>
  );
}
```

QR code [#qr-code]

Generate a QR code from the wallet address using any QR library:

```tsx
import QRCode from 'qrcode.react';
import { usePollar } from '@pollar/react';

export function ReceiveQR() {
  const { wallet } = usePollar();

  if (!wallet) return null;
  return <QRCode value={wallet.address} size={200} />;
}
```

Pre-built receive modal [#pre-built-receive-modal]

Pollar ships a ready-made receive view (QR + copyable address). Open it with `openReceiveModal()`:

```tsx
const { openReceiveModal } = usePollar();
// ...
<button onClick={openReceiveModal}>Receive</button>
```

SEP-7 payment request URI `coming soon` [#sep-7-payment-request-uri-coming-soon]

SEP-7 encodes destination, asset, amount, and memo into a single URI that any compatible Stellar wallet can scan to pre-fill a payment form:

```
web+stellar:pay?destination=GXXX&asset_code=USDC&asset_issuer=GXXX&amount=10
```

***

Transaction history [#transaction-history]

Using the `txHistory` state [#using-the-txhistory-state]

`txHistory` is a reactive state machine. Trigger a load through the underlying client and render `txHistory.data.records` once it reaches `loaded`:

```tsx
'use client';
import { useEffect } from 'react';
import { usePollar } from '@pollar/react';

export function TxHistory() {
  const { txHistory, getClient } = usePollar();

  useEffect(() => {
    getClient().fetchTxHistory({ limit: 20, offset: 0 });
  }, [getClient]);

  if (txHistory.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {txHistory.data.records.map(tx => (
        <li key={tx.id}>
          <span>{tx.summary}</span>
          <span>{tx.status}</span>
          <span>{new Date(tx.createdAt).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
}
```

See [Transaction History](https://docs.pollar.xyz/docs/core-concepts/transaction-history) for the record fields and offset-based pagination.

Pre-built history modal [#pre-built-history-modal]

`openTxHistoryModal()` renders a ready-made, paginated history list:

```tsx
const { openTxHistoryModal } = usePollar();
// ...
<button onClick={openTxHistoryModal}>History</button>
```

***

Asset balances [#asset-balances]

Reading balances from the wallet [#reading-balances-from-the-wallet]

`walletBalance` is a reactive state machine; call `refreshWalletBalance()` to load it. Each balance record exposes `code`, `balance`, `available`, `type`, and `enabledInApp`.

```tsx
'use client';
import { useEffect } from 'react';
import { usePollar } from '@pollar/react';

export function Balances() {
  const { walletBalance, refreshWalletBalance } = usePollar();

  useEffect(() => { refreshWalletBalance(); }, [refreshWalletBalance]);

  if (walletBalance.step !== 'loaded') return <p>Loading...</p>;

  return (
    <ul>
      {walletBalance.data.balances.map(b => (
        <li key={b.code}>
          {b.balance} {b.code}
        </li>
      ))}
    </ul>
  );
}
```

Pre-built balance modal [#pre-built-balance-modal]

`openWalletBalanceModal()` renders a ready-made balance view with a manual refresh.

***

Fiat on/off-ramp [#fiat-onoff-ramp]

Ramps integrate third-party providers (configure them under **Integrations → Ramps**). Open the pre-built widget with `openRampModal()`:

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function FiatButton() {
  const { openRampModal } = usePollar();

  return <button onClick={openRampModal}>Deposit / Withdraw</button>;
}
```

For headless control over quotes and on/off-ramp creation, use `getClient().getRampsQuote()`, `createOnRamp()`, and `createOffRamp()` from [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core).

See [Fiat Ramps](https://docs.pollar.xyz/docs/operator-guide/integrations/ramps) for setup.


# Dashboard Overview



The Pollar Dashboard at [dashboard.pollar.xyz](https://dashboard.pollar.xyz) is the control panel for your app's configuration. Sign in with Google — no Stellar wallet required.

Each app you create is isolated with its own API keys, wallets, and configuration. You can switch between apps from the top navigation bar.

***

Navigation [#navigation]

The per-app sidebar is organized into seven groups. A few sections are still gated behind a "coming soon" state — marked `upcoming` below.

Overview [#overview]

| Section         | What you do here                                 |
| --------------- | ------------------------------------------------ |
| **Home**        | Per-app landing with key status at a glance      |
| **Get started** | Onboarding checklist (hidden once you're set up) |

Build [#build]

| Section                 | What you do here                                                            |
| ----------------------- | --------------------------------------------------------------------------- |
| **Settings**            | App name, network, and auth token lifetimes                                 |
| **API Keys**            | Generate and manage publishable and secret keys                             |
| **Domains**             | Configure allowed origins (CORS) so the SDK can make requests from your app |
| **Webhooks** `upcoming` | Configure inbound webhook URLs and view event logs                          |
| **Branding**            | Customize the Pollar modals — theme, accent color, logo                     |
| **Members**             | View team members; the owner manages access                                 |

Users [#users]

| Section      | What you do here                                                    |
| ------------ | ------------------------------------------------------------------- |
| **Accounts** | Browse users, view login history, and manage accounts               |
| **Wallets**  | Browse user wallets — view status, balances, and fund them manually |

Treasury [#treasury]

| Section                 | What you do here                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tokens & Trustlines** | Configure which assets are automatically enabled on new user wallets. Funding Mode (Immediate / Deferred) is set here and on Account Funding. |
| **Account Funding**     | View and fund your funding (reserve) wallet; choose the funding mode                                                                          |
| **Sponsorship**         | Rules for which transaction types are sponsored and per-user limits                                                                           |
| **Transaction Policy**  | Restrict which destinations user transactions may target                                                                                      |
| **Auth Policy**         | Policies governing authentication (allowed methods / rules)                                                                                   |
| **Swap**                | Configure the swap venues exposed to end-users                                                                                                |
| **Earn**                | Configure the yield providers (DeFindex / Blend) exposed to end-users                                                                         |
| **Token Distribution**  | Configure claimable distribution rules — assets, amounts, rate limits                                                                         |

Integrations [#integrations]

| Section                       | What you do here                                            |
| ----------------------------- | ----------------------------------------------------------- |
| **Authentication** `upcoming` | Configure supported OAuth providers and email OTP           |
| **KYC** `upcoming`            | Configure identity-verification providers                   |
| **Ramps**                     | Configure fiat on/off-ramp providers (Bridge, Etherfuse, …) |
| **Pollar Pay**                | Pollar Pay integration                                      |

> A server-side **Wallets** integration (custodian / wallet-adapter) existed here previously and is currently hidden from the dashboard. For client-side wallet login (Stellar Wallets Kit, Privy), see [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters).

Monitor [#monitor]

| Section               | What you do here                               |
| --------------------- | ---------------------------------------------- |
| **Transactions**      | View on-chain transactions across your app     |
| **Logs**              | API request logs, errors, and delivery history |
| **Alerts** `upcoming` | Set up low-balance alerts via email or webhook |

Danger Zone [#danger-zone]

| Section                      | What you do here                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| **Archive app** (owner only) | Archive the app — disables its API keys and SDK access entirely (reversible by unarchiving) |

***

Get started checklist [#get-started-checklist]

When you create a new app, the Dashboard shows a checklist of required steps before you can go live:

1. **Configure API keys** — generate a publishable key to connect your SDK
2. **Configure domains** — add allowed origins so the SDK can make requests
3. **App wallet created and funded** — your funding wallet must be active on Stellar with enough XLM to cover wallet creation
4. **Enable trustlines** — configure at least one asset so user wallets can hold it
5. **Install the SDK and create your first wallet** — confirms the integration is working end-to-end

***

Testnet vs Mainnet [#testnet-vs-mainnet]

Each app targets a single network. Apps start on **Testnet**; moving to **Mainnet** is a gated request/approval flow (via the network control in the top bar), not a free toggle. API keys, wallets, and configuration are scoped to the app's network.

Start on Testnet — it's free and resets periodically. Request Mainnet when you're ready for production. See [Mainnet Checklist](https://docs.pollar.xyz/docs/guides/mainnet-checklist) before switching.


# How the C-Address Lifecycle Works



Pollar gives you a single passkey login call — `createSmartWallet()` / `loginSmartWallet()` — and handles the contract account underneath. This page explains what happens for **C-addresses**: useful when debugging, surfacing progress in your UI, or reasoning about costs.

G-address vs C-address at a glance [#g-address-vs-c-address-at-a-glance]

A **G-address** is a classic Stellar account controlled by an ed25519 keypair (in Pollar's custodial flow, that key is managed server-side via KMS). A **C-address** is a smart contract deployed on Soroban that *acts as an account* — its authorization logic lives in code, and in Pollar it is controlled by the user's **passkey** credential.

| Aspect           | G-address (custodial)     | C-address (passkey smart wallet)       |
| ---------------- | ------------------------- | -------------------------------------- |
| Identifier       | Starts with `G`           | Starts with `C`                        |
| Controlled by    | KMS key (server-side)     | User passkey (WebAuthn)                |
| Authorization    | Native ed25519 signature  | `__check_auth` in the contract         |
| Creation         | `createAccount` operation | `InvokeHostFunction` (contract deploy) |
| Holding an asset | `changeTrust` trustline   | SAC balance (no classic trustline)     |
| Keeping it alive | XLM reserve               | Storage rent + TTL                     |
| Fees             | Sponsored (fee-bump)      | Sponsored (fee-bump)                   |
| Flexibility      | Fixed (ed25519 only)      | Programmable auth                      |

The onboarding flow [#the-onboarding-flow]

`createSmartWallet()` walks a new user through the ceremony and deploy automatically. Observe each transition via `onAuthStateChange` (there is no separate `walletProgress` event):

```
idle ──▶ creating_passkey ──▶ deploying_smart_account ──▶ authenticating ──▶ authenticated
```

| Auth step                 | What it means                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `creating_passkey`        | The device WebAuthn ceremony runs (`create()` for a new user, `get()` for a returning one) |
| `deploying_smart_account` | Pollar deploys the sponsored C-address on-chain (new users)                                |
| `authenticating`          | Finalizing authentication with the Pollar server                                           |
| `authenticated`           | Session ready; `wallet.custody === 'smart'`, `wallet.address` is the `C…` contract id      |

For a returning user, `loginSmartWallet()` runs `get()` and skips the deploy.

Deploy [#deploy]

Creating a classic account is a single `createAccount` operation. Creating a C-address means deploying a contract: Pollar submits an `InvokeHostFunction` transaction that instantiates the smart-wallet contract with the user's passkey as the authorized owner. The contract's constructor runs atomically during deploy, so there's no separate "initialize" step. The resulting contract ID *is* the C-address.

Sponsorship: rent instead of reserve [#sponsorship-rent-instead-of-reserve]

This is the biggest conceptual difference, and Pollar hides most of it.

* **G-address:** Stellar requires a base XLM reserve (plus more per trustline). It's paid once and recovered if the account closes.
* **C-address:** There is no XLM reserve in the classic sense. Instead, every entry in the contract's storage has a &#x2A;*TTL (time-to-live)**. If the TTL lapses, the entry is archived and must be restored before use. Pollar's sponsor account extends the TTL on the user's behalf so the wallet stays live.

The practical implication: instead of a one-time reserve, there's a small *recurring* cost to keep a smart wallet alive, covered by Pollar's sponsor account.

Holding assets: the SAC [#holding-assets-the-sac]

C-addresses don't use classic trustlines. They interact with assets through the &#x2A;*Stellar Asset Contract (SAC)** — a built-in contract that wraps each classic Stellar asset. A C-address can receive a SAC-wrapped asset without an explicit trustline step (provided the issuer isn't gating with authorization flags). Pollar routes payments through the SAC for you, so the transaction API looks identical to the classic flow from your side. (Manual `setTrustline` does not apply to smart wallets.)

Signing: full transaction vs auth entries [#signing-full-transaction-vs-auth-entries]

For a custodial G-address, the KMS key signs the full transaction, which Pollar wraps in a fee-bump. For a C-address the signing model changes:

1. Pollar builds the contract invocation.
2. It simulates the transaction to discover which **auth entries** need signatures.
3. The user's **passkey** signs only those auth entries — the contract's `__check_auth` verifies them.
4. Pollar reassembles the transaction with the signed auth entries.
5. Pollar's sponsor account signs the envelope as the fee source and submits it.

You don't implement any of this — it's what `runTx` / `signAndSubmitTx` do internally for a smart wallet — but it's why smart-wallet transactions are contract invocations rather than classic payment ops.

How Pollar abstracts all of this [#how-pollar-abstracts-all-of-this]

| You call                        | Pollar handles                                                    |
| ------------------------------- | ----------------------------------------------------------------- |
| `createSmartWallet()`           | Passkey ceremony + sponsored deploy + TTL extension               |
| `loginSmartWallet()`            | Passkey `get()` + session                                         |
| `runTx()` / `signAndSubmitTx()` | Building the SAC invocation, passkey auth-entry signing, fee-bump |
| `onAuthStateChange()`           | Surfacing each onboarding transition                              |

The goal is that a passkey smart wallet is a login choice, not a rewrite. The differences above matter for debugging and cost modeling, but not for day-to-day integration.

Cost considerations [#cost-considerations]

On testnet, rent and fees are effectively free. On mainnet, each smart wallet carries a small recurring cost to keep its storage TTL extended — this replaces the one-time XLM reserve of the classic model. Pollar's sponsor account covers it automatically; account for it when estimating per-user costs at scale.

References [#references]

* [Contract accounts overview](https://developers.stellar.org/docs/build/guides/contract-accounts)
* [Smart wallets guide](https://developers.stellar.org/docs/build/guides/contract-accounts/smart-wallets)
* [Signing Soroban invocations](https://developers.stellar.org/docs/build/guides/transactions/signing-soroban-invocations)
* [Stellar Asset Contract (SAC)](https://developers.stellar.org/docs/tokens/stellar-asset-contract)
* [State archival (TTL / rent)](https://developers.stellar.org/docs/build/guides/archival)

Next steps [#next-steps]

* [C-Address Quickstart](https://docs.pollar.xyz/docs/smart-wallets/quickstart-c-address)
* [G-Addresses vs C-Addresses](https://docs.pollar.xyz/docs/smart-wallets/migration-g-to-c)


# G-Addresses vs C-Addresses



Pollar supports two account types side by side: **custodial G-addresses** (social / email login) and **passkey C-addresses** (smart wallets). This page covers how they relate, what your integration shares between them, and what differs.

> There is &#x2A;*no `walletType` switch and no in-place upgrade.** An account's custody is fixed when it is created: a user who signs up with a passkey gets a C-address; a user who signs up with social / email gets a custodial G-address. You cannot convert one into the other — they are different account types.

Offering both [#offering-both]

You don't pick one globally. You enable the login methods you want, and each user's choice determines their account type:

* Turn on &#x2A;*Build → Branding → Smart Wallet (passkey)** to show the passkey option.
* Keep social / email enabled for custodial G-address users.

The login modal then shows both; some users end up with C-addresses, others with G-addresses. Existing G-address users are unaffected.

What stays the same [#what-stays-the-same]

* **The transaction API.** `runTx` / `buildTx` + `signAndSubmitTx` have the same shape for both. For a smart wallet the SDK signs Soroban auth entries with the passkey credential instead of calling the custodial signer.
* **Fee sponsorship.** Pollar sponsors fees for both; you don't fund users manually.
* **The session / hook surface.** `usePollar()`, `wallet`, balances, and tx history work the same.

What differs [#what-differs]

1\. The address format [#1-the-address-format]

`wallet.address` starts with `C` for a smart wallet instead of `G`. If you store or display addresses, don't assume a `G` prefix.

2\. Custody discriminator [#2-custody-discriminator]

`wallet.custody` distinguishes the account types (and `wallet.provider` narrows further):

```typescript
const { wallet } = usePollar();
// custody: 'internal' → custodial G-address (provider: 'google' | 'github' | 'email' | …)
// custody: 'smart'    → passkey C-address (provider: 'passkey')
// custody: 'external' → user-connected wallet via an adapter
const isSmart = wallet?.custody === 'smart';
```

3\. Onboarding is a contract deploy [#3-onboarding-is-a-contract-deploy]

Custodial onboarding creates an account (and optionally trustlines). Smart onboarding runs a passkey ceremony and deploys a contract, extending its TTL. The auth states differ — `creating_passkey` / `deploying_smart_account` — see the [lifecycle explainer](https://docs.pollar.xyz/docs/smart-wallets/c-address-lifecycle).

4\. Assets use the SAC, not trustlines [#4-assets-use-the-sac-not-trustlines]

C-addresses don't use classic trustlines; they hold assets through the &#x2A;*Stellar Asset Contract (SAC)**. The SDK routes payments through the SAC for you. **Manual trustline management (`setTrustline`) is not applicable to smart wallets** and returns an error.

5\. Feature support today [#5-feature-support-today]

Some SDK surfaces are **not yet available** for smart wallets: **Swap**, **Earn**, and manual trustlines. Payments (send/receive) and balances work. Plan around these limits if you enable passkey login.

When to use which [#when-to-use-which]

* **Custodial G-addresses** — the broadest reach; social / email onboarding with zero device requirements. Fully supported across all SDK features.
* **Passkey C-addresses** — non-custodial, device-bound, programmable authorization; browser-only today, with Swap/Earn/trustlines still to come.

Next steps [#next-steps]

* [C-Address Quickstart](https://docs.pollar.xyz/docs/smart-wallets/quickstart-c-address)
* [How the C-Address Lifecycle Works](https://docs.pollar.xyz/docs/smart-wallets/c-address-lifecycle)


# Smart Wallets (C-Addresses)



**Smart wallets** let a user onboard with a **passkey** (WebAuthn — Face ID / Touch ID / a security key) that controls a Stellar **smart contract account**, a *C-address*, instead of a classic ed25519 account (a *G-address*). The account's authorization logic lives in a Soroban contract rather than in a fixed signature scheme.

Unlike Pollar's custodial login (social / email → platform-custodied G-address), a smart wallet is a **non-custodial, passkey-controlled** account: the user signs with their device credential, and Pollar sponsors the on-chain deploy and fees.

> **Availability:** implemented in `@pollar/core` / `@pollar/react` **0.10.1**. It is **browser-only** for now — `@pollar/react` wires the WebAuthn ceremony automatically on web; React Native needs a native passkey provider. Some features (Swap, Earn, and manual trustlines) are **not yet supported** for smart wallets.

***

How you use it [#how-you-use-it]

Smart wallet login is a distinct entry point — there is no `walletType` switch. Turn on the option and the SDK exposes it:

1. **Enable it in the dashboard:** &#x2A;*Build → Branding → Smart Wallet (passkey)**. This surfaces a passkey option in the login modal (`styles.smartWallet`).
2. **From the built-in modal:** `openLoginModal()` then renders a &#x2A;*Smart Wallet (passkey)** option with two actions — sign in (returning user) and create (new user).
3. **Headless:** call the client directly:

```typescript
const pollar = usePollar().getClient();

pollar.createSmartWallet(); // new user: passkey create() + sponsored C-address deploy
pollar.loginSmartWallet();  // returning user: passkey get()
```

Both drive `AuthState` (`creating_passkey` → `deploying_smart_account` → `authenticated`). After login the wallet is:

```typescript
usePollar().wallet;
// { custody: 'smart', address: 'C…', provider: 'passkey', existsOnStellar, fundingMode }
```

Payments use the **same** transaction API as any other wallet (`runTx` / `buildTx` + `signAndSubmitTx`) — for a smart wallet the SDK signs the Soroban **auth entries** with the passkey credential under the hood.

***

In this section [#in-this-section]

| <br />                                                                                              | <br />                                                           |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [C-Address Quickstart](https://docs.pollar.xyz/docs/smart-wallets/quickstart-c-address)             | Passkey sign-up through to a payment-ready smart wallet          |
| [G-Addresses vs C-Addresses](https://docs.pollar.xyz/docs/smart-wallets/migration-g-to-c)           | What differs (and what doesn't) between the two account types    |
| [How the C-Address Lifecycle Works](https://docs.pollar.xyz/docs/smart-wallets/c-address-lifecycle) | Deploy, rent/TTL, the SAC, and auth-entry signing under the hood |

How it differs from classic accounts at a glance [#how-it-differs-from-classic-accounts-at-a-glance]

| Aspect           | G-address (custodial, classic) | C-address (passkey smart wallet)       |
| ---------------- | ------------------------------ | -------------------------------------- |
| Identifier       | Starts with `G`                | Starts with `C`                        |
| Login            | Social / email (custodial)     | Passkey (WebAuthn)                     |
| Authorization    | Native ed25519 signature       | `__check_auth` in the contract         |
| Creation         | `createAccount` operation      | `InvokeHostFunction` (contract deploy) |
| Holding an asset | `changeTrust` trustline        | SAC balance (no classic trustline)     |
| Keeping it alive | XLM reserve (one-time)         | Storage rent + TTL (recurring)         |

See [How the C-Address Lifecycle Works](https://docs.pollar.xyz/docs/smart-wallets/c-address-lifecycle) for the full breakdown.


# C-Address Quickstart



This guide takes a user from zero to a **payment-ready smart wallet** on Stellar. The user signs in with a **passkey** (Face ID / Touch ID / security key) and Pollar handles the rest: deploying the contract account (C-address), sponsoring fees, and reaching a state where the wallet can send and receive assets. The user never sees a seed phrase or manages a private key.

> **Browser-only.** The passkey ceremony runs via WebAuthn in the browser. `@pollar/react` wires it automatically; a raw `@pollar/core` setup must supply a `passkey` (and `passkeySign`) ceremony. React Native support needs a native passkey provider.

> For how the lifecycle works under the hood, see the [C-Address Lifecycle](https://docs.pollar.xyz/docs/smart-wallets/c-address-lifecycle).

What you'll build [#what-youll-build]

A passkey login flow that ends with a deployed C-address, verifiable on Stellar Expert.

1\. Enable Smart Wallet in the dashboard [#1-enable-smart-wallet-in-the-dashboard]

Go to **Build → Branding** and turn on &#x2A;*Smart Wallet (passkey)**. This adds the passkey option (`styles.smartWallet`) to the SDK login modal.

2\. Install and mount the provider [#2-install-and-mount-the-provider]

```bash
npm install @pollar/react
```

```tsx
import { PollarProvider } from '@pollar/react';

export default function Root() {
  return (
    <PollarProvider client={{ apiKey: process.env.NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY! }}>
      <App />
    </PollarProvider>
  );
}
```

`@pollar/react` injects the browser passkey ceremony for you, so `createSmartWallet()` / `loginSmartWallet()` work out of the box on web.

3\. Sign the user in with a passkey [#3-sign-the-user-in-with-a-passkey]

The simplest path is the built-in modal — with Smart Wallet enabled it shows a **passkey** option (create for new users, sign-in for returning ones):

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function LoginButton() {
  const { isAuthenticated, wallet, openLoginModal } = usePollar();

  if (isAuthenticated) return <p>✓ Smart wallet ready — {wallet?.address}</p>;
  return <button onClick={openLoginModal}>Sign in</button>;
}
```

For a headless flow, call the client directly:

```tsx
'use client';
import { usePollar } from '@pollar/react';

export function PasskeyButtons() {
  const { getClient } = usePollar();
  return (
    <>
      <button onClick={() => getClient().createSmartWallet()}>Create passkey wallet</button>
      <button onClick={() => getClient().loginSmartWallet()}>Sign in with passkey</button>
    </>
  );
}
```

`createSmartWallet()` runs the WebAuthn `create()` ceremony and deploys a sponsored C-address; `loginSmartWallet()` runs `get()` for a returning user. Both settle `AuthState` to `authenticated`.

4\. (Optional) Follow the flow in your UI [#4-optional-follow-the-flow-in-your-ui]

Progress is exposed through `AuthState` (there is no separate `walletProgress` event). Subscribe with `onAuthStateChange`:

```typescript
getClient().onAuthStateChange((state) => {
  // state.step: 'creating_passkey' | 'deploying_smart_account' | 'authenticating' | 'authenticated' | 'error'
});
```

| Step                      | Meaning                                               |
| ------------------------- | ----------------------------------------------------- |
| `creating_passkey`        | Running the device WebAuthn ceremony                  |
| `deploying_smart_account` | Deploying the sponsored C-address on-chain (new user) |
| `authenticating`          | Finalizing authentication with the Pollar server      |
| `authenticated`           | Session ready; `wallet.custody === 'smart'`           |

5\. Verify on-chain [#5-verify-on-chain]

The deployed contract is real and permanent. Build a verification link from the C-address:

```typescript
const { wallet } = usePollar();
const contractUrl = `https://testnet.stellar.expert/contract/${wallet?.address}`;
```

6\. Send a payment [#6-send-a-payment]

Once authenticated, send assets with the **same** transaction API as any wallet — the SDK signs the Soroban auth entries with the passkey credential internally:

```typescript
await getClient().runTx('payment', {
  destination: 'GDESTINATION...', // G-address or C-address
  amount: '10.00',
  asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GA5ZSE...' },
});
```

> Swap, Earn, and manual trustlines are **not yet supported** for smart wallets.

Next steps [#next-steps]

* [G-Addresses vs C-Addresses](https://docs.pollar.xyz/docs/smart-wallets/migration-g-to-c)
* [How the C-Address Lifecycle Works](https://docs.pollar.xyz/docs/smart-wallets/c-address-lifecycle)


# Error Codes



Pollar surfaces errors in two places: the **Server / SDK API** (HTTP responses) and the **client SDK** (method outcomes and reactive state). This page documents both, plus the real error codes.

***

Error model [#error-model]

Server / SDK API responses [#server--sdk-api-responses]

Every API response uses a fixed envelope. Errors are **flat** — there is no `error` wrapper and no `message`/`status` field in the body (the HTTP status code carries the status):

```json
{
  "code": "INSUFFICIENT_FUNDS_FOR_TRUSTLINE",
  "success": false
}
```

Some errors include extra fields (e.g. validation issues):

```json
{
  "code": "VALIDATION_ERROR",
  "success": false,
  "details": { "fieldErrors": { "publicKey": ["Must start with G"] } }
}
```

Successful responses are `{ "content": <data>, "code": "<SUCCESS_CODE>", "success": true }`.

Client SDK [#client-sdk]

Most `@pollar/core` methods **do not throw** on operational failures. Instead they:

* Return an **outcome** object — e.g. `buildTx`, `signAndSubmitTx`, `runTx` resolve to `{ status: 'error', details?, resultCode? }` (vs `'built' | 'success' | 'pending'`).
* Drive **reactive state** — `tx.step === 'error'` carries `{ phase, details }`; auth/balance/history states expose `{ step: 'error', message }`.

```typescript
const result = await pollar.runTx('payment', { destination, amount, asset });
if (result.status === 'error') {
  console.error(result.details, result.resultCode);
}
```

The only error that is **thrown** is `PollarFlowError` (exported from `@pollar/core`), raised when a flow method is called out of order (e.g. verifying an OTP code before one was sent). Its `code` is always `'INVALID_FLOW'`:

```typescript
import { PollarFlowError } from '@pollar/core';

try {
  pollar.verifyEmailCode('123456');
} catch (err) {
  if (err instanceof PollarFlowError) {
    // called the wrong step for the current AuthState
  }
}
```

Auth flow error codes (surfaced on the `error` `AuthState`) are exported as `AUTH_ERROR_CODES` (e.g. `SESSION_EXPIRED`, `EMAIL_CODE_INVALID`, `WALLET_AUTH_FAILED`, `PASSKEY_FAILED`).

***

Auth, API keys & access [#auth-api-keys--access]

| Code                       | Description                                                | Resolution                                                     |
| -------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| `INVALID_CREDENTIALS`      | Missing or invalid credentials                             | Check the credentials you are sending                          |
| `FORBIDDEN`                | Authenticated but not allowed to perform this action       | Verify the key type / permissions                              |
| `API_KEY_NOT_FOUND`        | API key does not exist or was revoked                      | Generate a new key from **Build → API Keys**                   |
| `API_KEY_EXPIRED`          | API key has expired                                        | Rotate the key                                                 |
| `API_KEY_TYPE_NOT_ALLOWED` | Publishable key used on a secret-key route (or vice versa) | Use a secret key on the Server API, publishable on the SDK API |
| `ORIGIN_NOT_ALLOWED`       | Request origin is not in the app's allowed origins         | Add the origin under **Build → Domains**                       |
| `RATE_LIMITED`             | Too many requests                                          | Back off and retry                                             |

> Keys are network-specific by prefix: `pub_testnet_` / `pub_mainnet_` (publishable) and `sec_testnet_` / `sec_mainnet_` (secret).

***

Validation & general [#validation--general]

| Code                    | Description                                | Resolution                                  |
| ----------------------- | ------------------------------------------ | ------------------------------------------- |
| `VALIDATION_ERROR`      | Malformed body or failed schema validation | Check the payload against the API reference |
| `INVALID_JSON`          | Request body is not valid JSON             | Send a valid JSON body                      |
| `USER_NOT_FOUND`        | User does not exist in your app            | Verify the `externalId` / user              |
| `APPLICATION_NOT_FOUND` | Application not found for the key          | Verify the API key                          |
| `INTERNAL_SERVER_ERROR` | Unexpected server error                    | Retry; contact support if it persists       |
| `NOT_IMPLEMENTED`       | Endpoint exists but is not yet wired up    | Feature is on the roadmap                   |

***

Wallet & funding [#wallet--funding]

| Code                           | Description                                                        | Resolution                                                 |
| ------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `WALLET_NOT_FOUND`             | Public key is not a wallet owned by your app                       | Verify the `publicKey`                                     |
| `WALLET_NOT_FUNDED`            | Wallet exists but is not yet funded                                | Activate the wallet before transacting / adding trustlines |
| `WALLET_ALREADY_FUNDED`        | Wallet is already active                                           | Safe to ignore — idempotent activation                     |
| `WALLET_CREATION_FAILED`       | Failed to create the wallet on Stellar                             | Retry — transient Stellar network issue                    |
| `FUND_XLM_FAILED`              | Funding the XLM reserve failed                                     | Check the funding wallet balance, then retry               |
| `FRIENDBOT_NOT_AVAILABLE`      | Testnet Friendbot funding is unavailable                           | Retry shortly                                              |
| `WALLET_ADAPTER_NOT_SUPPORTED` | Server-side wallet provisioning not supported for BYO custody apps | Provision wallets via your adapter                         |

***

Trustlines [#trustlines]

| Code                               | Description                                             | Resolution                                                |
| ---------------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| `TRUSTLINE_FAILED`                 | Failed to create/remove a trustline on Stellar          | Retry — transient network issue                           |
| `INSUFFICIENT_FUNDS_FOR_TRUSTLINE` | Not enough XLM to cover the trustline reserve (0.5 XLM) | Top up the funding wallet                                 |
| `TRUSTLINE_HAS_BALANCE`            | Cannot remove a trustline that still holds a balance    | Move the balance to zero first                            |
| `NO_DEFAULT_TRUSTLINES`            | No default assets are configured for the app            | Configure assets under **Treasury → Tokens & Trustlines** |

***

Transactions [#transactions]

| Code                       | Description                                   | Resolution                                            |
| -------------------------- | --------------------------------------------- | ----------------------------------------------------- |
| `SDK_TX_BUILD_ERROR`       | The transaction could not be built            | Check operation params (destination, amount, asset)   |
| `TX_UNSUPPORTED_OPERATION` | Operation type is not supported               | Use a supported operation (e.g. `payment`)            |
| `TX_INVALID_SIGNED_XDR`    | The signed XDR is malformed                   | Re-sign from the built XDR                            |
| `TX_SIGN_FAILED`           | Signing failed                                | Retry; for external wallets, re-approve in the wallet |
| `TX_SUBMIT_FAILED`         | Stellar rejected the transaction              | Inspect `resultCode` on the outcome                   |
| `TX_IDEMPOTENCY_CONFLICT`  | A conflicting submission is already in flight | Wait and check transaction status                     |

***

Distribution [#distribution]

| Code                                  | Description                                   | Resolution                                               |
| ------------------------------------- | --------------------------------------------- | -------------------------------------------------------- |
| `DISTRIBUTION_RULE_NOT_FOUND`         | The distribution rule does not exist          | Verify the rule id                                       |
| `DISTRIBUTION_ASSET_NOT_ENABLED`      | The asset is not enabled for distribution     | Enable it under **Treasury → Token Distribution**        |
| `DISTRIBUTION_RULE_DISABLED`          | The rule is disabled                          | Enable the rule                                          |
| `DISTRIBUTION_RULE_EXPIRED`           | The rule's validity window has ended          | —                                                        |
| `DISTRIBUTION_RULE_EXHAUSTED`         | The rule's total allocation is used up        | —                                                        |
| `DISTRIBUTION_RATE_LIMIT_EXCEEDED`    | The user exceeded the rule's claim rate limit | Configured per rule in **Treasury → Token Distribution** |
| `DISTRIBUTION_NO_DISTRIBUTION_WALLET` | No distribution wallet is configured          | Configure one under **Treasury → Token Distribution**    |

***

KYC & Ramps [#kyc--ramps]

| Code                             | Description                            |
| -------------------------------- | -------------------------------------- |
| `SDK_KYC_PROVIDER_NOT_FOUND`     | KYC provider not found                 |
| `SDK_KYC_PROVIDER_NOT_ENABLED`   | KYC provider not enabled for the app   |
| `SDK_KYC_SESSION_EXPIRED`        | KYC session expired                    |
| `SDK_KYC_VERIFICATION_NOT_FOUND` | KYC verification not found             |
| `SDK_RAMPS_PROVIDER_NOT_FOUND`   | Ramp provider not found                |
| `SDK_RAMPS_QUOTE_NOT_FOUND`      | Ramp quote not found                   |
| `SDK_RAMPS_QUOTE_EXPIRED`        | Ramp quote expired — request a new one |
| `SDK_RAMPS_TX_NOT_FOUND`         | Ramp transaction not found             |

***

Session, DPoP & passkeys [#session-dpop--passkeys]

End-user session and token errors (sdk-api). These are handled by the SDK's auth flow; surface to users as "please sign in again".

| Code                                                                                  | Description                                 |
| ------------------------------------------------------------------------------------- | ------------------------------------------- |
| `SDK_AUTH_INVALID_TOKEN` / `SDK_AUTH_TOKEN_EXPIRED`                                   | Access token invalid or expired             |
| `SDK_AUTH_DPOP_REQUIRED` / `SDK_AUTH_DPOP_INVALID` / `SDK_AUTH_DPOP_USE_NONCE`        | DPoP proof required / invalid / needs nonce |
| `SDK_REFRESH_TOKEN_INVALID` / `_EXPIRED` / `_REUSED`                                  | Refresh token invalid, expired, or reused   |
| `PASSKEY_CHALLENGE_MISSING` / `PASSKEY_VERIFICATION_FAILED` / `PASSKEY_DEPLOY_FAILED` | Passkey ceremony errors                     |

> This is not the full enum — the server defines additional internal codes (hub-api admin, Pollar Pay, authentik, wallet-adapter). The codes above are the ones an SDK or Server API integrator is most likely to encounter.

***

Handling errors in the SDK [#handling-errors-in-the-sdk]

```typescript
import { PollarFlowError } from '@pollar/core';

// Operational failures come back as outcomes — no try/catch needed.
const result = await pollar.runTx('payment', { destination, amount, asset });
if (result.status === 'error') {
  switch (result.resultCode) {
    case 'tx_insufficient_balance':
      // not enough of the asset
      break;
    default:
      console.error(result.details);
  }
}

// Misuse of the flow API throws.
try {
  pollar.sendEmailCode('user@example.com');
} catch (err) {
  if (err instanceof PollarFlowError) {
    // wrong step for the current AuthState
  }
}
```

To observe transaction failures reactively, subscribe to `onTransactionStateChange` and inspect `state.phase` / `state.details` when `state.step === 'error'`.


# MCP Gateway



The **Pollar MCP Gateway** lets AI agents and other programmatic clients read and manage your Pollar applications over the [Model Context Protocol](https://modelcontextprotocol.io) (MCP). It is a curated, scoped surface in front of the Pollar API — built for tools like Claude Code, Claude Desktop, Cursor, and any MCP-capable client.

**Endpoint:** `https://mcp.api.pollar.xyz/mcp` (Streamable HTTP)

**Authentication:** a **Personal Access Token** (`pat_…`) sent as `Authorization: Bearer pat_…`. The token's scopes decide what the agent can do; a request without a token is rejected.

***

Get a Personal Access Token [#get-a-personal-access-token]

Personal Access Tokens (PATs) are **account-level** credentials — they belong to you, not to a single app, and can cover all of your apps or a chosen subset.

1. In the dashboard, open **Account → Personal Access Tokens**.
2. Click **Create token** and give it a **name**.
3. Pick its **scopes** (see below) — or toggle **Full access** for all scopes.
4. (Optional) Restrict it to **specific applications**. Left unrestricted, it covers every app you own.
5. (Optional) Set an **expiry date**.
6. Copy the token (`pat_…`) immediately — it is shown only once.

Revoke a token anytime from the same screen; any client using it loses access immediately.

Scopes [#scopes]

A token grants `resource:action` permissions. A tool fails with `403` if the token lacks the scope it needs, so grant the **least** a client requires — a read-only research agent only needs the `:read` scopes; a provisioning agent needs the matching `:write` scopes.

| Scope                          | Grants                                        |
| ------------------------------ | --------------------------------------------- |
| `applications:read` / `:write` | Read apps; create apps; edit allowed domains  |
| `api_keys:read` / `:write`     | List API keys; create publishable/secret keys |
| `wallets:read` / `:write`      | Read wallets & balances; fund wallets         |
| `assets:read` / `:write`       | Read assets; enable trustlines                |
| `transactions:read`            | Read transaction history                      |
| `users:read`                   | Read SDK end-users                            |
| `distribution:read` / `:write` | Read and create token-distribution rules      |

> Selecting **Full access** (`*`) grants every scope. The dashboard also exposes a few additional resource scopes for related dashboard features.

***

Tools [#tools]

Each tool maps to a Pollar API operation and requires the matching scope on your token.

Read [#read]

| Tool                           | Arguments                 | Returns                                 |
| ------------------------------ | ------------------------- | --------------------------------------- |
| `list_applications`            | —                         | Applications the token can access       |
| `get_application`              | `id`                      | App detail (network, wallets, settings) |
| `get_application_wallets`      | `id`                      | App + end-user wallets                  |
| `get_wallet_balances`          | `id`, `publicKey`         | On-chain balances for a wallet          |
| `get_application_transactions` | `id`, `limit?`, `offset?` | Transaction history (paginated)         |
| `get_application_users`        | `id`, `limit?`, `offset?` | SDK end-users (paginated)               |

Reads require the matching `:read` scope (e.g. `wallets:read`).

Write [#write]

| Tool                       | Arguments                                                          | Scope                |
| -------------------------- | ------------------------------------------------------------------ | -------------------- |
| `create_application`       | `name`                                                             | `applications:write` |
| `create_api_key`           | `id`, `name`, `type?`, `allow_native_clients?`, `expires_at?`      | `api_keys:write`     |
| `enable_asset`             | `id`, `code`, `issuer`, `name`                                     | `assets:write`       |
| `create_distribution_rule` | `id`, `assetId`, `name`, `amountPerUser`, `maxClaims`, `period`, … | `distribution:write` |
| `fund_testnet_wallet`      | `id`, `publicKey`                                                  | `wallets:write`      |

`fund_testnet_wallet` tops up a wallet via the Stellar **testnet** friendbot — typically the app's funding (global) wallet. Get the public key from `get_application_wallets` first.

Edit [#edit]

| Tool                         | Arguments               | Scope                |
| ---------------------------- | ----------------------- | -------------------- |
| `update_application_domains` | `id`, `allowed_origins` | `applications:write` |

`update_application_domains` **replaces** the app's entire allowed-origins (CORS) list, so pass the full set you want to keep — not just additions.

Helpers [#helpers]

These combine several reads (and, where noted, a conditional write) into one answer.

| Tool                             | Arguments     | Does                                                                                                                                             |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `get_application_wallet_by_role` | `id`, `role?` | Resolve a wallet by role (GLOBAL / FUNDING / GAS / DISTRIBUTION) and report whether it is funded                                                 |
| `ensure_wallet_funded`           | `id`, `role?` | Fund the role's wallet via the testnet friendbot **only if** it is not already funded (mainnet wallets are reported, not funded)                 |
| `check_application_readiness`    | `id`          | Evaluate the dashboard "Get started" config steps (API keys, domains, app-wallet funding, trustlines) and report whether the app is ready to use |

`role` defaults to `GLOBAL`; use `FUNDING` / `GAS` / `DISTRIBUTION` once an app has split wallets. "Funded" means the wallet's account exists on Stellar — for exact balances call `get_wallet_balances`.

***

Confirmation behavior [#confirmation-behavior]

Clients that support MCP tool annotations use them to decide when to prompt:

* **Reads and creates run automatically** (including `fund_testnet_wallet` and `ensure_wallet_funded`, which are harmless idempotent testnet top-ups).
* **Edits that overwrite existing state** — currently `update_application_domains` — **prompt for confirmation** before running.

***

Connect a client [#connect-a-client]

Replace `pat_…` with your token in every example.

**Claude Code**

```bash
claude mcp add --transport http pollar https://mcp.api.pollar.xyz/mcp --header "Authorization: Bearer pat_…"

claude mcp get pollar   # verify it was installed
```

**Claude Desktop / Cursor / Windsurf / Cline** — add a `mcpServers` entry (config files: Claude Desktop `claude_desktop_config.json`, Cursor `~/.cursor/mcp.json`, Windsurf `~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "pollar": {
      "type": "http",
      "url": "https://mcp.api.pollar.xyz/mcp",
      "headers": { "Authorization": "Bearer pat_…" }
    }
  }
}
```

**VS Code (GitHub Copilot)** — add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "pollar": {
      "type": "http",
      "url": "https://mcp.api.pollar.xyz/mcp",
      "headers": { "Authorization": "Bearer pat_…" }
    }
  }
}
```

**Clients that only support stdio** — bridge to the HTTP endpoint with `mcp-remote`:

```json
{
  "mcpServers": {
    "pollar": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.api.pollar.xyz/mcp", "--header", "Authorization: Bearer pat_…"]
    }
  }
}
```

After editing the config, restart the client. Once connected it should list the Pollar tools (`list_applications`, `get_application`, …).

***

Example prompts [#example-prompts]

With the gateway connected, you can ask an agent things like:

* *"List my Pollar apps and tell me which ones are ready to use."* → `list_applications` + `check_application_readiness`
* *"Fund the testnet global wallet for app `…` if it isn't funded yet."* → `ensure_wallet_funded`
* *"Add `http://localhost:3000` to app `…`'s allowed domains."* → `update_application_domains` (the client confirms first)
* *"Create a publishable API key for app `…`."* → `create_api_key`

***

Security [#security]

* A PAT is as sensitive as a password — never commit it to version control; store it in your client's secret config.
* Grant the minimum scopes a client needs, and restrict the token to specific apps when possible.
* Set an expiry for short-lived or shared tokens, and revoke any token you suspect is exposed from **Account → Personal Access Tokens**.


# @pollar/core



Framework-agnostic TypeScript client for Pollar. Use this package directly if you are not using React, or to build custom integrations on top of the Pollar platform.

**Version:** `0.10.1`

```bash
npm install @pollar/core
```

***

`PollarClient` [#pollarclient]

```typescript
import { PollarClient } from '@pollar/core';

const pollar = new PollarClient({
  apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx',
});
```

**Constructor options:**

| Option           | Type             | Default                        | Description                                                                                        |
| ---------------- | ---------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `apiKey`         | `string`         | —                              | **Required.** Your Pollar publishable key.                                                         |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                    | Target Stellar network: `'testnet'` or `'mainnet'`.                                                |
| `baseUrl`        | `string`         | `'https://sdk.api.pollar.xyz'` | Override the Pollar API base URL. The SDK appends `/v1` to it. Useful for self-hosted deployments. |

> Additional options are supported for non-web runtimes and advanced use: `storage`, `keyManager`, `walletAdapters` (array — see [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters)), `requestTimeoutMs` (default `10000`), `submitTimeoutMs` (default `30000`), `retry`, `deviceLabel`, `visibilityProvider`, `openAuthUrl`, `oauthRedirectUri`, `passkey`, `logLevel`, `logger`, `onStorageDegrade`, and `maxIdleMs`. See the `PollarClientConfig` type for the full list (React Native consumers must inject a `storage` adapter, and provide `openAuthUrl` for OAuth).

***

Authentication [#authentication]

Pollar's built-in authentication providers are Google OAuth, GitHub OAuth, Email OTP, and external Stellar wallets (Freighter and Albedo are auto-registered). You can register more wallet providers — every Stellar Wallets Kit wallet, or Privy embedded wallets — through the `walletAdapters` config option; see [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters). A fifth path, passkey **Smart Wallet** login, is covered under Smart Wallets. All flows update `AuthState`, which can be observed via `onAuthStateChange`.

***

`pollar.login(options)` [#pollarloginoptions]

Unified entry point for starting an authentication flow. For email, this initiates the session and sends the OTP code in a single call. For wallet providers, it connects and authenticates the wallet.

```typescript
import { WalletType } from '@pollar/core';

// OAuth providers
pollar.login({ provider: 'google' });
pollar.login({ provider: 'github' });

// Email OTP (sends code automatically)
pollar.login({ provider: 'email', email: 'user@example.com' });

// Built-in external wallets — provider is the wallet id
pollar.login({ provider: WalletType.FREIGHTER }); // 'freighter-native'
pollar.login({ provider: WalletType.ALBEDO });    // 'albedo-native'

// Any wallet registered via `walletAdapters` — provider is that adapter's id
pollar.login({ provider: 'xbull' });  // Stellar Wallets Kit
pollar.login({ provider: 'privy' });  // Privy embedded wallet
```

The `provider` for a wallet is the adapter's `type`. Built-in Freighter/Albedo
use the `WalletType` enum (`'freighter-native'` / `'albedo-native'`); wallets
added through [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters)
use their own ids (`'xbull'`, `'lobstr'`, `'privy'`, …).

| Option     | Type                                               | Description                                                   |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------- |
| `provider` | `'google' \| 'github' \| 'email' \| (string & {})` | Authentication provider, or a registered wallet adapter's id. |
| `email`    | `string`                                           | Required when `provider` is `'email'`.                        |

***

Email OTP — step-by-step flow [#email-otp--step-by-step-flow]

For use cases that require manual control over each step of the email OTP flow (e.g. custom UI), the following methods are available individually:

`pollar.beginEmailLogin()` [#pollarbeginemaillogin]

Initializes a new email session. Transitions `AuthState` to `entering_email`.

```typescript
pollar.beginEmailLogin();
```

`pollar.sendEmailCode(email)` [#pollarsendemailcodeemail]

Sends the OTP code to the provided email address. Must be called when `AuthState.step === 'entering_email'`.

```typescript
pollar.sendEmailCode('user@example.com');
```

`pollar.verifyEmailCode(code)` [#pollarverifyemailcodecode]

Verifies the OTP code entered by the user and completes authentication. Must be called when `AuthState.step === 'entering_code'`.

```typescript
pollar.verifyEmailCode('123456');
```

***

`pollar.cancelLogin()` [#pollarcancellogin]

Cancels any in-progress authentication flow and resets `AuthState` to `idle`.

```typescript
pollar.cancelLogin();
```

***

`pollar.logout()` [#pollarlogout]

Signs out the current user, clears the session from storage, and resets all client state.

```typescript
pollar.logout();
```

***

`pollar.getAuthState()` [#pollargetauthstate]

Returns the current authentication state synchronously.

```typescript
const state = pollar.getAuthState();

if (state.step === 'authenticated') {
  console.log(state.session);
}
```

***

`pollar.onAuthStateChange(callback)` [#pollaronauthstatechangecallback]

Subscribes to authentication state changes. The callback is invoked immediately with the current state, and on every subsequent change. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onAuthStateChange((state) => {
  if (state.step === 'authenticated') {
    console.log('Logged in:', state.session);
  }
});

// Later:
unsubscribe();
```

**`AuthState` steps:**

| Step                       | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `idle`                     | No active session or flow.                               |
| `creating_session`         | Creating a client session on the server.                 |
| `entering_email`           | Waiting for the user to provide their email address.     |
| `sending_email`            | Sending the OTP code to the user's email.                |
| `entering_code`            | Waiting for the user to enter the OTP code.              |
| `verifying_email_code`     | Verifying the submitted OTP code.                        |
| `opening_oauth`            | Opening the OAuth provider window.                       |
| `connecting_wallet`        | Connecting to the external wallet extension.             |
| `signing_wallet_challenge` | The wallet is counter-signing the SEP-10 challenge.      |
| `wallet_not_installed`     | The requested wallet extension is not installed.         |
| `authenticating_wallet`    | Authenticating with the connected wallet.                |
| `creating_passkey`         | Running the passkey (Smart Wallet) device ceremony.      |
| `deploying_smart_account`  | Deploying the passkey C-address on-chain (new users).    |
| `authenticating`           | Finalizing authentication with the Pollar server.        |
| `authenticated`            | User is authenticated. `session` and `verified` are set. |
| `error`                    | An error occurred. `message` and `errorCode` are set.    |

***

Network [#network]

`pollar.getNetwork()` [#pollargetnetwork]

Returns the currently active Stellar network.

```typescript
const network = pollar.getNetwork(); // 'testnet' | 'mainnet'
```

***

`pollar.setNetwork(network)` [#pollarsetnetworknetwork]

Switches the active Stellar network.

```typescript
pollar.setNetwork('mainnet');
```

***

`pollar.onNetworkStateChange(callback)` [#pollaronnetworkstatechangecallback]

Subscribes to network state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onNetworkStateChange((state) => {
  if (state.step === 'connected') {
    console.log('Network:', state.network);
  }
});
```

***

Transactions [#transactions]

Pollar handles transaction building and signing through a state machine. Use `onTransactionStateChange` to observe progress in your UI.

`pollar.buildTx(operation, params, options?)` [#pollarbuildtxoperation-params-options]

Builds an unsigned Stellar transaction on the server. Transitions `TransactionState` through `building` → `built` (or `error`).

```typescript
await pollar.buildTx('payment', {
  destination: 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  amount: '10.00',
  asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GABC...' },
});
```

| Parameter   | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `operation` | `string` | Stellar operation type (e.g. `payment`). |
| `params`    | `object` | Operation-specific parameters.           |
| `options`   | `object` | Optional build-time overrides.           |

***

`pollar.signAndSubmitTx(unsignedXdr)` [#pollarsignandsubmittxunsignedxdr]

Signs and submits a previously built transaction. For custodial wallets (social/email login), signing is performed server-side. For external wallets (Freighter/Albedo), signing is performed client-side and submitted directly to Horizon.

Must be called when `TransactionState.step === 'built'`.

```typescript
const state = pollar.getTransactionState();

if (state?.step === 'built') {
  await pollar.signAndSubmitTx(state.buildData.unsignedXdr);
}
```

***

`pollar.getTransactionState()` [#pollargettransactionstate]

Returns the current transaction state synchronously, or `null` if no transaction is in progress.

```typescript
const state = pollar.getTransactionState();
```

***

`pollar.onTransactionStateChange(callback)` [#pollarontransactionstatechangecallback]

Subscribes to transaction state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onTransactionStateChange((state) => {
  if (state.step === 'success') {
    console.log('Transaction hash:', state.hash);
  }
});
```

**`TransactionState` steps:**

| Step                          | Description                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `idle`                        | No transaction in progress.                                                         |
| `building`                    | Building the transaction on the server.                                             |
| `built`                       | Transaction built. `buildData.unsignedXdr` is available.                            |
| `signing`                     | Signing the built transaction.                                                      |
| `signed`                      | Signed. `signedXdr` is available.                                                   |
| `submitting`                  | Submitting the signed transaction.                                                  |
| `signing-submitting`          | Custodial atomic sign+submit (server swallows the boundary).                        |
| `building-signing-submitting` | Custodial atomic build+sign+submit (`runTx` / `buildAndSignAndSubmitTx`).           |
| `submitted`                   | Accepted by Horizon; awaiting ledger confirmation. `hash` is set.                   |
| `success`                     | Transaction confirmed. `hash` is available.                                         |
| `error`                       | Transaction failed. Carries `phase`, and optionally `code` / `message` / `details`. |

***

Wallet Balance [#wallet-balance]

`pollar.refreshBalance()` [#pollarrefreshbalance]

Fetches the current balances for the **authenticated** wallet and drives the wallet-balance state machine (takes no arguments).

```typescript
await pollar.refreshBalance();
```

***

`pollar.getWalletBalance(publicKey, network?)` [#pollargetwalletbalancepublickey-network]

Fetches balances for an **arbitrary** public key without touching the balance state machine. Returns the balance content directly.

```typescript
const { balances } = await pollar.getWalletBalance('GXXX...');
```

***

`pollar.getWalletBalanceState()` [#pollargetwalletbalancestate]

Returns the current wallet balance state synchronously.

```typescript
const state = pollar.getWalletBalanceState();

if (state.step === 'loaded') {
  console.log(state.data.balances);
}
```

***

`pollar.onWalletBalanceStateChange(callback)` [#pollaronwalletbalancestatechangecallback]

Subscribes to wallet balance state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onWalletBalanceStateChange((state) => {
  if (state.step === 'loaded') {
    console.log(state.data.balances);
  }
});
```

***

Transaction History [#transaction-history]

`pollar.fetchTxHistory(params?)` [#pollarfetchtxhistoryparams]

Fetches paginated transaction history for the authenticated wallet.

```typescript
await pollar.fetchTxHistory({
  limit: 20,
  offset: 0,
});
```

| Option   | Type     | Default | Description                                               |
| -------- | -------- | ------- | --------------------------------------------------------- |
| `limit`  | `number` | —       | Number of records to return.                              |
| `offset` | `number` | `0`     | Offset for pagination (history uses offset-based paging). |

> Only transactions submitted through Pollar appear here. A record reads `PENDING` immediately after build and updates to `SUCCESS` or `FAILED` once submitted. Each record exposes `id`, `hash`, `network`, `status`, `operation`, `summary`, `feeXlm`, `resultCode`, and `createdAt`.

***

`pollar.getTxHistoryState()` [#pollargettxhistorystate]

Returns the current transaction history state synchronously.

```typescript
const state = pollar.getTxHistoryState();

if (state.step === 'loaded') {
  console.log(state.data.records);
}
```

***

`pollar.onTxHistoryStateChange(callback)` [#pollarontxhistorystatechangecallback]

Subscribes to transaction history state changes. Returns an unsubscribe function.

```typescript
const unsubscribe = pollar.onTxHistoryStateChange((state) => {
  if (state.step === 'loaded') {
    console.log(state.data.records);
  }
});
```

***

KYC [#kyc]

Pollar provides a KYC (Know Your Customer) flow that integrates with third-party identity verification providers.

`pollar.getKycProviders(country)` [#pollargetkycproviderscountry]

Returns the list of available KYC providers for the given country code.

```typescript
const providers = await pollar.getKycProviders('US');
```

***

`pollar.getKycStatus(providerId?)` [#pollargetkycstatusproviderid]

Returns the current KYC status for the authenticated user. Optionally scoped to a specific provider. Resolves to an object — read `.status` for the value.

```typescript
const { status, level, providerId, expiresAt } = await pollar.getKycStatus();
// status: 'none' | 'pending' | 'approved' | 'rejected'
```

***

`pollar.startKyc(body)` [#pollarstartkycbody]

Initiates a KYC verification session with the specified provider.

```typescript
const session = await pollar.startKyc({
  providerId: 'provider_id',
  level: 'basic',
  redirectUrl: 'https://yourapp.com/kyc/callback',
});
```

***

`pollar.resolveKyc(providerId, level?)` [#pollarresolvekycproviderid-level]

Resolves the outcome of a completed KYC session.

```typescript
await pollar.resolveKyc('provider_id', 'basic');
```

***

`pollar.pollKycStatus(providerId, opts?)` [#pollarpollkycstatusproviderid-opts]

Polls the KYC status until it reaches a terminal state (`approved` or `rejected`), or until the timeout is exceeded.

```typescript
const finalStatus = await pollar.pollKycStatus('provider_id', {
  intervalMs: 2000,
  timeoutMs: 60000,
});
```

| Option       | Type     | Description                        |
| ------------ | -------- | ---------------------------------- |
| `intervalMs` | `number` | Polling interval in milliseconds.  |
| `timeoutMs`  | `number` | Maximum wait time before throwing. |

**`KycStatus` values:** `'none'` · `'pending'` · `'approved'` · `'rejected'`

**`KycLevel` values:** `'basic'` · `'intermediate'` · `'enhanced'`

***

Ramps [#ramps]

Pollar supports on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows through integrated third-party providers.

`pollar.getRampsQuote(query)` [#pollargetrampsquotequery]

Returns available quotes for a ramp operation.

```typescript
const quotes = await pollar.getRampsQuote({
  direction: 'onramp',
  fiatCurrency: 'USD',
  cryptoAsset: 'USDC',
  amount: '100',
});
```

***

`pollar.createOnRamp(body)` [#pollarcreateonrampbody]

Creates an on-ramp transaction (fiat → crypto).

```typescript
const onramp = await pollar.createOnRamp({ ... });
console.log(onramp.depositInstructions);
// { txId, provider, status, kycUrl?, pendingSignature?, depositInstructions }
```

***

`pollar.createOffRamp(body)` [#pollarcreateofframpbody]

Creates an off-ramp transaction (crypto → fiat).

```typescript
const offramp = await pollar.createOffRamp({ ... });
```

***

`pollar.getRampTransaction(txId)` [#pollargetramptransactiontxid]

Returns the current state of a ramp transaction by ID.

```typescript
const tx = await pollar.getRampTransaction('tx_id');
console.log(tx.status);
```

***

`pollar.pollRampTransaction(txId, opts?)` [#pollarpollramptransactiontxid-opts]

Polls a ramp transaction until it reaches a terminal status.

```typescript
const finalStatus = await pollar.pollRampTransaction('tx_id', {
  intervalMs: 3000,
  timeoutMs: 120000,
});
```

| Option       | Type     | Description                        |
| ------------ | -------- | ---------------------------------- |
| `intervalMs` | `number` | Polling interval in milliseconds.  |
| `timeoutMs`  | `number` | Maximum wait time before throwing. |

***

App Config [#app-config]

`pollar.getAppConfig()` [#pollargetappconfig]

Returns the application configuration associated with your API key, as configured in the Pollar Dashboard.

```typescript
const config = await pollar.getAppConfig();
```

***

One-shot transactions [#one-shot-transactions]

For build → sign → submit in a single call, use `runTx` (an alias of
`buildAndSignAndSubmitTx`). Both drive the same `TransactionState` machine as the
split calls and resolve to a `SubmitOutcome` (`{ status: 'success' | 'pending' | 'error', … }`).

```typescript
const outcome = await pollar.runTx('payment', {
  destination: 'GXXX...',
  amount: '10.00',
  asset: { type: 'credit_alphanum4', code: 'USDC', issuer: 'GABC...' },
});
if (outcome.status === 'error') console.error(outcome.details, outcome.resultCode);
```

Lower-level building blocks are also available: `signTx(unsignedXdr)` (external
wallets only), `submitTx(signedXdr)`, `getTxStatus(hash)`, `createAccount()`, and
`resetTransactionState()`.

***

Enabled assets & trustlines [#enabled-assets--trustlines]

The app's dashboard-enabled assets paired with the authenticated wallet's
on-chain trustline state.

* `pollar.getEnabledAssetsState()` — current state snapshot.
* `pollar.refreshAssets()` — refresh the enabled-assets state machine.
* `pollar.onEnabledAssetsStateChange(cb)` — subscribe; returns an unsubscribe fn.
* `pollar.setTrustline(asset, opts?)` — establish (omit `limit`) or remove
  (`limit: '0'`) a trustline. Pass `{ sponsored: true }` so the app covers the
  reserve + fee when eligible; otherwise the user's wallet pays. Returns a
  `TrustlineOutcome`.

```typescript
await pollar.setTrustline({ code: 'USDC', issuer: 'GABC...' }, { sponsored: true });
```

***

Swap [#swap]

Multi-venue asset swaps (SDEX / AMM). Empty `getSwapConfig()` means swap is
disabled for the app — hide the UI.

* `pollar.getSwapConfig()` → `Promise<SwapVenue[]>` — venues this app exposes.
* `pollar.getSwapTokens()` → `Promise<SwapToken[]>` — curated "buy" token catalog.
* `pollar.getSwapQuote(params)` → `Promise<SwapQuote[]>` — quotes ranked best-first.
* `pollar.swap(quote, opts?)` → `Promise<SubmitOutcome>` — execute a quote
  (establishes the buy-asset trustline first when needed). Drives `TransactionState`.

***

Earn [#earn]

Yield vaults (DeFindex) and lending pools (Blend). Empty `getEarnProviders()`
means Earn is disabled — hide the UI.

* `pollar.getEarnProviders()` → `Promise<EarnProviderId[]>`.
* `pollar.getEarnOpportunities(provider)` → `Promise<EarnOpportunity[]>` — vaults/pools with live APY.
* `pollar.getEarnPosition(params)` → `Promise<EarnPosition>` — the wallet's position.
* `pollar.earnDeposit(params)` → `Promise<SubmitOutcome>`.
* `pollar.earnWithdraw(params)` → `Promise<SubmitOutcome>`.

***

Token distribution [#token-distribution]

* `pollar.listDistributionRules()` → `Promise<DistributionRule[]>` — claimable rules for the app.
* `pollar.claimDistributionRule(body)` → claims a rule for the authenticated user.

***

Sessions [#sessions]

Manage the authenticated user's active sessions (devices).

* `pollar.listSessions()` → `Promise<SessionInfo[]>`.
* `pollar.getSessionsState()` / `pollar.fetchSessions()` / `pollar.onSessionsStateChange(cb)` — the sessions state machine.
* `pollar.revokeSession(familyId)` — revoke one session.
* `pollar.logout({ everywhere: true })` or `pollar.logoutEverywhere()` — sign out everywhere.

***

Smart Wallets (passkey) [#smart-wallets-passkey]

Passkey-backed Soroban **C-address** login. Requires a `passkey` ceremony in
`PollarClientConfig` (`@pollar/react` supplies one via `@simplewebauthn/browser`;
browser-only for now).

* `pollar.loginSmartWallet()` — log in with an existing passkey wallet.
* `pollar.createSmartWallet()` — create + deploy a new passkey C-address.

See [Smart Wallets](https://docs.pollar.xyz/docs/smart-wallets/overview) for the full flow.

***

Types [#types]

```typescript
import type {
  PollarClientConfig,
  PollarLoginOptions,
  AuthState,
  AuthErrorCode,
  NetworkState,
  TransactionState,
  TxBuildBody,
  TxBuildContent,
  TxHistoryState,
  TxHistoryParams,
  TxHistoryRecord,
  WalletBalanceState,
  WalletBalanceRecord,
  KycLevel,
  KycStatus,
  KycFlow,
  KycProvider,
  KycStartBody,
  KycStartResponse,
  RampsQuoteQuery,
  RampQuote,
  RampsQuoteResponse,
  RampsOnrampBody,
  RampsOnrampResponse,
  RampsOfframpBody,
  RampsOfframpResponse,
  RampsTransactionResponse,
  RampTxStatus,
  RampDirection,
  SwapVenue,
  SwapToken,
  SwapQuote,
  SwapQuoteParams,
  EarnProviderId,
  EarnOpportunity,
  EarnPosition,
  SessionInfo,
  DistributionRule,
  WalletInfo,
  PollarFlowError,
} from '@pollar/core';

import { WalletType } from '@pollar/core';
```


# @pollar/react



React hooks and pre-built UI components for Pollar. Built on top of `@pollar/core`.

**Version:** `0.10.1`

```bash
npm install @pollar/react
```

***

`<PollarProvider>` [#pollarprovider]

Wraps your application root. Required for all hooks and components to work. Internally renders every Pollar modal — login, transaction, send, receive, KYC, ramp, tx history, wallet balance, enabled-assets, swap, earn, sessions, and distribution-rules — so you do not need to mount them manually.

```tsx
import { PollarProvider } from '@pollar/react';

<PollarProvider
  client={{ apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx' }}
>
  <App />
</PollarProvider>
```

**Props:**

| Prop               | Type                                 | Required | Description                                                                                                                                                                                                                                                                                           |
| ------------------ | ------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client`           | `PollarClientConfig \| PollarClient` | Yes      | A `PollarClientConfig` (the provider builds the client) or a pre-built `PollarClient` instance. Locked at first render.                                                                                                                                                                               |
| `appConfig`        | `PollarConfig`                       | No       | Local override of the remote `/applications/config` (styles, app name). If provided, the remote fetch is skipped.                                                                                                                                                                                     |
| `adapters`         | `PollarAdapters`                     | No       | Transaction-building adapters (e.g. `@pollar/accesly-adapter`), consumed via `createPollarAdapterHook`. This is **not** the wallet-login slot — wallet login providers go on the client's `walletAdapters` config; see [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters). |
| `onStorageDegrade` | `OnStorageDegrade`                   | No       | Notified when persistent storage silently degrades to in-memory mode.                                                                                                                                                                                                                                 |

> To register wallet-login providers (Stellar Wallets Kit, Privy), put them on `client.walletAdapters`, not on this component. See [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters).

**`PollarClientConfig`:**

| Option           | Type             | Default                                                | Description                                 |
| ---------------- | ---------------- | ------------------------------------------------------ | ------------------------------------------- |
| `apiKey`         | `string`         | —                                                      | **Required.** Your Pollar API key.          |
| `stellarNetwork` | `StellarNetwork` | `'testnet'`                                            | Target network: `'testnet'` or `'mainnet'`. |
| `baseUrl`        | `string`         | `'https://sdk.api.pollar.xyz'` (the SDK appends `/v1`) | Override the Pollar API base URL.           |

***

`usePollar()` [#usepollar]

The primary hook. Provides access to all Pollar functionality from a single import. Must be used inside `<PollarProvider>`.

```tsx
'use client';
import { usePollar } from '@pollar/react';

function MyComponent() {
  const {
    isAuthenticated,
    verified,
    wallet,
    login,
    logout,
    buildTx,
    signAndSubmitTx,
    signTx,
    submitTx,
    buildAndSignAndSubmitTx,
    runTx,
    tx,
    txHistory,
    network,
    setNetwork,
    walletBalance,
    refreshWalletBalance,
    enabledAssets,
    refreshAssets,
    setTrustline,
    getSwapConfig,
    getSwapTokens,
    getSwapQuote,
    swap,
    getEarnProviders,
    getEarnOpportunities,
    getEarnPosition,
    earnDeposit,
    earnWithdraw,
    getClient,
    openLoginModal,
    openTxModal,
    openKycModal,
    openRampModal,
    openTxHistoryModal,
    openWalletBalanceModal,
    openSendModal,
    openReceiveModal,
    openEnabledAssetsModal,
    openSwapModal,
    openEarnModal,
    openSessionsModal,
    openDistributionRulesModal,
    sessions,
    appConfig,
    styles,
  } = usePollar();
}
```

***

Authentication [#authentication]

| Property          | Type                                    | Description                                                                                                                                                                                                                                |
| ----------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `isAuthenticated` | `boolean`                               | Whether the user has an active session.                                                                                                                                                                                                    |
| `verified`        | `boolean`                               | `true` once the server has confirmed the session (login / refresh / resume). `false` while a cold-start session is still optimistic — gate sensitive actions (e.g. signing) on this.                                                       |
| `wallet`          | `WalletInfo \| null`                    | The authenticated wallet as a discriminated union over `custody` (`internal` \| `smart` \| `external`), or `null` when unauthenticated. Use `wallet.address` for the on-chain address and `wallet.provider` for the login/wallet provider. |
| `login`           | `(options: PollarLoginOptions) => void` | Initiates an authentication flow.                                                                                                                                                                                                          |
| `logout`          | `() => void`                            | Signs out the current user and clears the session.                                                                                                                                                                                         |

**`PollarLoginOptions`:**

| Value                                  | Description                                                                                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{ provider: 'google' }`               | Opens Google OAuth flow.                                                                                                                                             |
| `{ provider: 'github' }`               | Opens GitHub OAuth flow.                                                                                                                                             |
| `{ provider: 'email', email: string }` | Sends an OTP code to the provided email address.                                                                                                                     |
| `{ provider: WalletType.FREIGHTER }`   | Connects the built-in Freighter wallet (id `'freighter-native'`).                                                                                                    |
| `{ provider: WalletType.ALBEDO }`      | Connects the built-in Albedo wallet (id `'albedo-native'`).                                                                                                          |
| `{ provider: '<adapter id>' }`         | Any wallet registered via `walletAdapters` (`'xbull'`, `'lobstr'`, `'privy'`, …). See [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters). |

***

Transactions [#transactions]

| Property                  | Type                                                      | Description                                                                             |
| ------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tx`                      | `TransactionState`                                        | Current transaction state (reactive).                                                   |
| `buildTx`                 | `(operation, params, options?) => Promise<BuildOutcome>`  | Builds an unsigned Stellar transaction.                                                 |
| `signAndSubmitTx`         | `(unsignedXdr?: string) => Promise<SubmitOutcome>`        | Signs and submits a built transaction (defaults to the current `built` XDR if omitted). |
| `signTx`                  | `(unsignedXdr: string) => Promise<SignOutcome>`           | External-wallet only — sign without submitting.                                         |
| `submitTx`                | `(signedXdr: string) => Promise<SubmitOutcome>`           | Submits an already-signed XDR.                                                          |
| `buildAndSignAndSubmitTx` | `(operation, params, options?) => Promise<SubmitOutcome>` | One-shot build → sign → submit.                                                         |
| `runTx`                   | `(operation, params, options?) => Promise<SubmitOutcome>` | Alias of `buildAndSignAndSubmitTx`.                                                     |
| `openTxModal`             | `() => void`                                              | Opens the transaction modal programmatically.                                           |

The transaction modal opens automatically when `buildTx` is called. See [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core) for `TransactionState` step details and the per-call `BuildOutcome` / `SignOutcome` / `SubmitOutcome` return types.

***

Network [#network]

| Property     | Type                                | Description                          |
| ------------ | ----------------------------------- | ------------------------------------ |
| `network`    | `StellarNetwork`                    | Currently active network.            |
| `setNetwork` | `(network: StellarNetwork) => void` | Switches the active Stellar network. |

***

Wallet Balance [#wallet-balance]

| Property                 | Type                  | Description                                                              |
| ------------------------ | --------------------- | ------------------------------------------------------------------------ |
| `walletBalance`          | `WalletBalanceState`  | Current wallet balance state (reactive).                                 |
| `refreshWalletBalance`   | `() => Promise<void>` | Refreshes balances for the authenticated wallet. Drives `walletBalance`. |
| `openWalletBalanceModal` | `() => void`          | Opens the wallet balance modal.                                          |

> For an arbitrary public key / network, use `getClient().getWalletBalance(publicKey)` from `@pollar/core`.

***

Enabled assets & trustlines [#enabled-assets--trustlines]

| Property                 | Type                                                                                    | Description                                                                                                                          |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `enabledAssets`          | `EnabledAssetsState`                                                                    | App-enabled assets paired with the wallet's trustline state.                                                                         |
| `refreshAssets`          | `() => Promise<void>`                                                                   | Refreshes the enabled-assets state.                                                                                                  |
| `setTrustline`           | `(asset: { code; issuer }, opts?: { limit?; sponsored? }) => Promise<TrustlineOutcome>` | Establish (omit `limit`) or remove (`limit: '0'`) a trustline. Pass `sponsored: true` so the app covers reserve + fee when eligible. |
| `openEnabledAssetsModal` | `() => void`                                                                            | Opens the enabled-assets / trustline modal.                                                                                          |

***

Swap [#swap]

| Property        | Type                                                                      | Description                                      |
| --------------- | ------------------------------------------------------------------------- | ------------------------------------------------ |
| `getSwapConfig` | `() => Promise<SwapVenue[]>`                                              | Venues this app exposes (empty = swap disabled). |
| `getSwapTokens` | `() => Promise<SwapToken[]>`                                              | Curated "buy" token catalog.                     |
| `getSwapQuote`  | `(params: SwapQuoteParams) => Promise<SwapQuote[]>`                       | Quotes ranked best-first.                        |
| `swap`          | `(quote: SwapQuote, opts?: { autoTrustline? }) => Promise<SubmitOutcome>` | Executes a quote; drives `tx`.                   |
| `openSwapModal` | `() => void`                                                              | Opens the swap modal.                            |

***

Earn [#earn]

| Property               | Type                                                       | Description                                          |
| ---------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `getEarnProviders`     | `() => Promise<EarnProviderId[]>`                          | Yield providers this app exposes (empty = disabled). |
| `getEarnOpportunities` | `(provider: EarnProviderId) => Promise<EarnOpportunity[]>` | Vaults/pools with live APY.                          |
| `getEarnPosition`      | `(params: EarnPositionParams) => Promise<EarnPosition>`    | The wallet's position.                               |
| `earnDeposit`          | `(params: EarnTxParams) => Promise<SubmitOutcome>`         | Deposit into a vault/pool; drives `tx`.              |
| `earnWithdraw`         | `(params: EarnTxParams) => Promise<SubmitOutcome>`         | Withdraw from a vault/pool; drives `tx`.             |
| `openEarnModal`        | `() => void`                                               | Opens the Earn modal.                                |

***

Transaction History [#transaction-history]

| Property             | Type             | Description                          |
| -------------------- | ---------------- | ------------------------------------ |
| `txHistory`          | `TxHistoryState` | Current tx history state (reactive). |
| `openTxHistoryModal` | `() => void`     | Opens the transaction history modal. |

***

KYC [#kyc]

| Property       | Type                                                                                  | Description                       |
| -------------- | ------------------------------------------------------------------------------------- | --------------------------------- |
| `openKycModal` | `(options?: { country?: string; level?: KycLevel; onApproved?: () => void }) => void` | Opens the KYC verification modal. |

| Option       | Type         | Default   | Description                                                          |
| ------------ | ------------ | --------- | -------------------------------------------------------------------- |
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.                 |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level: `'basic'`, `'intermediate'`, or `'enhanced'`.    |
| `onApproved` | `() => void` | —         | Callback invoked when the KYC verification is successfully approved. |

***

Ramps [#ramps]

| Property        | Type         | Description                        |
| --------------- | ------------ | ---------------------------------- |
| `openRampModal` | `() => void` | Opens the fiat on/off-ramp widget. |

***

Utilities [#utilities]

| Property    | Type                 | Description                                                           |
| ----------- | -------------------- | --------------------------------------------------------------------- |
| `getClient` | `() => PollarClient` | Returns the underlying `PollarClient` instance for direct API access. |
| `appConfig` | `PollarConfig`       | Application configuration fetched from the Pollar Dashboard.          |
| `styles`    | `PollarStyles`       | Resolved styles, merging remote config with any local overrides.      |

***

Modal entry points [#modal-entry-points]

All Pollar modals are mounted inside `<PollarProvider>` and controlled programmatically:

| Function                       | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `openLoginModal()`             | Opens the login modal.                      |
| `openTxModal()`                | Opens the transaction modal.                |
| `openKycModal(options?)`       | Opens the KYC modal.                        |
| `openRampModal()`              | Opens the ramp widget.                      |
| `openTxHistoryModal()`         | Opens the transaction history modal.        |
| `openWalletBalanceModal()`     | Opens the wallet balance modal.             |
| `openSendModal()`              | Opens the send-payment modal.               |
| `openReceiveModal()`           | Opens the receive modal.                    |
| `openEnabledAssetsModal()`     | Opens the enabled-assets / trustline modal. |
| `openSwapModal()`              | Opens the swap modal.                       |
| `openEarnModal()`              | Opens the Earn modal.                       |
| `openSessionsModal()`          | Opens the active-sessions modal.            |
| `openDistributionRulesModal()` | Opens the distribution-rules modal.         |

***

Components [#components]

`<WalletButton>` [#walletbutton]

Pre-built button that handles the complete authentication flow. When logged out, opens the login modal. When logged in, shows the wallet address with a dropdown for balance, transaction history, and logout.

```tsx
import { WalletButton } from '@pollar/react';

<WalletButton />
```

No props required. Appearance comes from your remote dashboard configuration (or the `appConfig` override passed to `<PollarProvider>`), exposed as `styles` on `usePollar()`.

***

`<KycModal>` [#kycmodal]

Pre-built KYC verification modal. Can be rendered directly when you need more control than `openKycModal()` provides.

```tsx
import { KycModal } from '@pollar/react';

<KycModal
  onClose={() => setOpen(false)}
  country="US"
  level="basic"
  onApproved={() => console.log('KYC approved')}
/>
```

| Prop         | Type         | Default   | Description                                             |
| ------------ | ------------ | --------- | ------------------------------------------------------- |
| `onClose`    | `() => void` | —         | **Required.** Called when the user dismisses the modal. |
| `country`    | `string`     | `'MX'`    | ISO 3166-1 alpha-2 country code to filter providers.    |
| `level`      | `KycLevel`   | `'basic'` | Required KYC level.                                     |
| `onApproved` | `() => void` | —         | Called when KYC is successfully approved.               |

***

`<KycStatus>` [#kycstatus]

Displays the current KYC status for the authenticated user.

```tsx
import { KycStatus } from '@pollar/react';

<KycStatus />
```

***

`<RampWidget>` [#rampwidget]

Pre-built fiat on/off-ramp widget with support for on-ramp (fiat → crypto) and off-ramp (crypto → fiat) flows.

```tsx
import { RampWidget } from '@pollar/react';

<RampWidget onClose={() => setOpen(false)} />
```

| Prop      | Type         | Description                                              |
| --------- | ------------ | -------------------------------------------------------- |
| `onClose` | `() => void` | **Required.** Called when the user dismisses the widget. |

***

`<WalletBalanceModal>` [#walletbalancemodal]

Displays the token balances of the authenticated wallet with a manual refresh option.

```tsx
import { WalletBalanceModal } from '@pollar/react';

<WalletBalanceModal onClose={() => setOpen(false)} />
```

| Prop      | Type         | Description                                             |
| --------- | ------------ | ------------------------------------------------------- |
| `onClose` | `() => void` | **Required.** Called when the user dismisses the modal. |

***

Template components [#template-components]

Template components handle rendering only — they receive all data and callbacks as props and contain no internal logic. Use them to build fully custom UI while reusing Pollar's layout and visual structure.

| Component                          | Description                                                   |
| ---------------------------------- | ------------------------------------------------------------- |
| `<WalletButtonTemplate>`           | Wallet button (logged-out / logged-in) presentation.          |
| `<LoginModalTemplate>`             | Login provider selection and email OTP screens.               |
| `<KycModalTemplate>`               | KYC provider selection and verification screens.              |
| `<RampWidgetTemplate>`             | Ramp input, quote selection, and payment instruction screens. |
| `<TransactionModalTemplate>`       | Transaction details, signing, and result screens.             |
| `<TxHistoryModalTemplate>`         | Transaction history list screen.                              |
| `<WalletBalanceModalTemplate>`     | Wallet balance screen.                                        |
| `<EnabledAssetsModalTemplate>`     | Enabled-assets / trustline screen.                            |
| `<SendModalTemplate>`              | Send-payment screen.                                          |
| `<SwapModalTemplate>`              | Swap screen (exports `SwapAssetOption`).                      |
| `<ReceiveModalTemplate>`           | Receive (address / QR) screen.                                |
| `<SessionsModalTemplate>`          | Active-sessions list screen.                                  |
| `<DistributionRulesModalTemplate>` | Claimable distribution rules screen.                          |

> Live (non-template) modal components are also exported for direct rendering: `SendModal`, `SwapModal`, `EarnModal`, `ReceiveModal`, `EnabledAssetsModal`, `WalletBalanceModal`, `SessionsModal`, `DistributionRulesModal`, plus `KycStatus`, `RouteDisplay`, and `TxStatusView`.

Import the corresponding `*Props` type for full type safety:

```tsx
import {
  TransactionModalTemplate,
  type TransactionModalTemplateProps,
  WalletBalanceModalTemplate,
  type WalletBalanceModalTemplateProps,
} from '@pollar/react';
```

***

Types [#types]

```typescript
import type {
  PollarConfig,
  PollarStyles,
  LoginButtonProps,
  AuthModalProps,
  KycStep,
  RampStep,
  TransactionModalTemplateProps,
  WalletBalanceModalTemplateProps,
  // re-exported from @pollar/core so you can author custom login providers
  PollarAuthProvider,
  AuthProviderContext,
} from '@pollar/react';
```

Core types such as `WalletInfo`, `TransactionState`, `TxHistoryState`, `EnabledAssetsState`, `WalletBalanceContent`, `SwapQuote`, `EarnOpportunity`, `PollarLoginOptions`, `StellarNetwork`, and `WalletType` are imported directly from `@pollar/core`.


# Pollar Server API



REST API for backend operations. All endpoints require your **secret key** — never call these from client-side code.

**Base URL:** `https://api.pollar.xyz` — all routes are versioned under `/v1`.

**Authentication:** pass your secret key in the `x-pollar-api-key` header (not `Authorization`).

```bash
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

Wallets are identified by their on-chain **public key** (`G…` address), not by an opaque id.

**Response envelope.** Every response is wrapped:

* Success: `{ "content": <data>, "code": "<SUCCESS_CODE>", "success": true }`
* Error: `{ "code": "<ERROR_CODE>", "success": false }` (plus any extra fields). The HTTP status carries the status; there is no `status` field in the body.

***

Wallets [#wallets]

`POST /v1/wallets/activate` [#post-v1walletsactivate]

Activates a wallet by funding its XLM reserve on-chain. Used in Deferred mode when a business event occurs (KYC approved, first deposit, etc.).

```bash
POST https://api.pollar.xyz/v1/wallets/activate
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
}
```

`publicKey` must be a 56-character Stellar public key starting with `G`.

**Response codes:**

| Code              | Meaning                                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `200 OK`          | Wallet activated. XLM reserve funded on-chain.                                                                                                  |
| `400 Bad Request` | Missing or malformed `publicKey` (`VALIDATION_ERROR`).                                                                                          |
| `403 Forbidden`   | `publicKey` belongs to a wallet owned by another app (`FORBIDDEN`).                                                                             |
| `404 Not Found`   | `publicKey` is not a known wallet (`WALLET_NOT_FOUND`).                                                                                         |
| `409 Conflict`    | Wallet is already funded (`WALLET_ALREADY_FUNDED`). Safe to ignore.                                                                             |
| `502 Bad Gateway` | Funding the XLM reserve failed (`FUND_XLM_FAILED`) — e.g. the funding wallet has insufficient XLM, or a transient Stellar network issue. Retry. |

**Response body (`200`):**

```json
{
  "content": {
    "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "amount": "1.5"
  },
  "code": "SERVER_WALLET_ACTIVATED",
  "success": true
}
```

`amount` is the XLM reserve funded (1 XLM base + 0.5 per configured asset).

***

Trustlines [#trustlines]

Enable or disable asset trustlines on a user wallet. The wallet must already be funded.

`POST /v1/wallets/:address/trustlines/default` [#post-v1walletsaddresstrustlinesdefault]

Enables trustlines for all of your app's configured (default) assets on the given wallet.

```bash
POST https://api.pollar.xyz/v1/wallets/GXXX.../trustlines/default
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
```

`POST /v1/wallets/:address/trustlines` [#post-v1walletsaddresstrustlines]

Enables explicit trustlines for the assets in the body.

```bash
POST https://api.pollar.xyz/v1/wallets/GXXX.../trustlines
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "assets": [
    { "code": "USDC", "issuer": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }
  ]
}
```

Returns `code: "SERVER_TRUSTLINES_ENABLED"`.

`DELETE /v1/wallets/:address/trustlines/:asset` [#delete-v1walletsaddresstrustlinesasset]

Removes a trustline (the asset must have a zero balance). The `:asset` segment is `CODE:ISSUER` (e.g. `USDC:GA5Z…`). Returns `code: "SERVER_TRUSTLINE_DISABLED"`.

***

Users [#users]

Register an app user (and optionally provision a wallet for them).

`POST /v1/users` [#post-v1users]

```bash
POST https://api.pollar.xyz/v1/users
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "externalId": "your-user-id",
  "email": "user@example.com"
}
```

`externalId` (1–255 chars) is required; `email`, `firstName`, `lastName`, and `avatar` are optional. Returns `201` with `code: "SERVER_USER_REGISTERED"`.

`POST /v1/users/with-wallet` [#post-v1userswith-wallet]

Same body as above, but also creates a Stellar wallet for the user in one call. Returns `201` with `code: "SERVER_USER_WALLET_CREATED"`.

***

Tokens [#tokens]

`POST /v1/tokens/verify` [#post-v1tokensverify]

Validates an SDK end-user access token server-side (e.g. to authenticate a user on your backend from a token minted client-side by the SDK).

```bash
POST https://api.pollar.xyz/v1/tokens/verify
x-pollar-api-key: sec_testnet_xxxxxxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "token": "<sdk access token>"
}
```

On success returns `code: "SERVER_TOKEN_VERIFIED"` with content
`{ userId, applicationId, expiresAt, network, wallet, profile, authProvider }`.

**Error codes:** `SDK_AUTH_TOKEN_EXPIRED` (`401`), `SDK_AUTH_INVALID_TOKEN` (`401`), `SDK_TOKEN_WRONG_APPLICATION` (`403`).

***

Error format [#error-format]

Errors are returned in the standard envelope:

```json
{
  "code": "FUND_XLM_FAILED",
  "success": false
}
```

The HTTP status code carries the status. For the list of codes see [Error Codes](https://docs.pollar.xyz/docs/sdk-reference/error-codes).


# Wallet Adapters



Pollar's default login is **custodial** — social / email sign-in and a
platform-custodied Stellar G-address. Wallet adapters let you extend `login()`
with other providers: external Stellar wallets (Freighter, Albedo, xBull, …) and
embedded wallets (Privy). Each adapter is a `WalletAdapter` from `@pollar/core`
that you register on the client's `walletAdapters` array.

> All adapters below are published at **0.10.1** and peer on
> `@pollar/core@^0.10.1` / `@pollar/react@^0.10.1`.

***

The `walletAdapters` slot [#the-walletadapters-slot]

Adapters are registered through the `walletAdapters` array on
`PollarClientConfig`. Each adapter renders its own button in the login modal and
is reachable with `login({ provider: adapter.type })`.

```ts
import { PollarClient } from '@pollar/core';

const pollar = new PollarClient({
  apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx',
  walletAdapters: [
    /* adapters from the packages below */
  ],
});
```

The built-in `FreighterAdapter` / `AlbedoAdapter` are **auto-registered** — you
get Freighter and Albedo with no adapter installed. Entries in `walletAdapters`
are added on top and override a built-in by reusing its `type`. If you omit the
slot entirely, `@pollar/core` falls back to just Freighter + Albedo.

Login ids for the built-ins come from the `WalletType` enum:

```ts
import { WalletType } from '@pollar/core';

pollar.login({ provider: WalletType.FREIGHTER }); // 'freighter-native'
pollar.login({ provider: WalletType.ALBEDO });    // 'albedo-native'
```

Adapter packages keep their heavy dependencies out of `@pollar/core`'s bundle,
so you only pay for what you install.

***

`@pollar/stellar-wallets-kit-adapter` [#pollarstellar-wallets-kit-adapter]

Plugs [Stellar Wallets Kit](https://stellarwalletskit.dev) into Pollar as a set
of wallet adapters. One install gives Pollar access to **every kit module** —
Freighter, Albedo, xBull, Lobstr, Rabet, Hana, Bitget, OneKey, Klever, Fordefi,
CactusLink, HotWallet (12 by default), plus Ledger / Trezor / WalletConnect via
opt-in.

```bash
npm install @pollar/stellar-wallets-kit-adapter @creit.tech/stellar-wallets-kit
```

`@pollar/core` and `@creit.tech/stellar-wallets-kit` are peer dependencies.

```ts
import { PollarClient } from '@pollar/core';
import { stellarWalletsKitAdapters } from '@pollar/stellar-wallets-kit-adapter';
import { Networks } from '@creit.tech/stellar-wallets-kit';

const pollar = new PollarClient({
  apiKey: 'pub_mainnet_xxxxxxxxxxxxxxxxxxxx',
  walletAdapters: stellarWalletsKitAdapters({ network: Networks.PUBLIC }),
});

// Log in with any registered kit wallet — provider is the wallet id.
pollar.login({ provider: 'xbull' });
```

With React it is the same, on the `client` prop:

```tsx
import { PollarProvider } from '@pollar/react';
import { stellarWalletsKitAdapters } from '@pollar/stellar-wallets-kit-adapter';
import { Networks } from '@creit.tech/stellar-wallets-kit';

<PollarProvider
  client={{
    apiKey: 'pub_testnet_xxxxxxxxxxxxxxxxxxxx',
    walletAdapters: stellarWalletsKitAdapters({ network: Networks.TESTNET }),
  }}
>
  {/* your app */}
</PollarProvider>;
```

Every registered wallet renders as a button inside Pollar's `LoginModal`,
collapsed behind a single **Wallet** gateway (their shared `meta.group`).

`stellarWalletsKitAdapters(options)` [#stellarwalletskitadaptersoptions]

Returns a `WalletAdapter[]` — one adapter per kit module — that you assign to
`walletAdapters`.

| Option      | Type                | Notes                                                                                                                                                                        |
| ----------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `network`   | `Networks`          | **Required** (since 0.8.0). `Networks.PUBLIC` or `Networks.TESTNET`. No default — the kit is a global singleton, so the chain must be explicit to avoid cross-chain signing. |
| `modules?`  | `ModuleInterface[]` | Wallet modules to drive. Defaults to the 12 zero-config modules. Passing this **fully replaces** the default.                                                                |
| `picker?`   | `KitPickerOptions`  | `wallets` (subset of ids), `labels` (per-wallet overrides), `groupLabel` (gateway label, default `'Wallet'`), plus `/picker`-only fields.                                    |
| `logLevel?` | `LogLevel`          | `'silent' \| 'error' \| 'warn' \| 'info' \| 'debug'`. Default `'info'`.                                                                                                      |
| `logger?`   | `PollarLogger`      | Log sink. Defaults to `console`.                                                                                                                                             |

**Default wallets (no `modules`):** `albedo`, `bitget`, `cactuslink`,
`fordefi`, `freighter`, `hana`, `hotwallet`, `klever`, `lobstr`, `onekey`,
`rabet`, `xbull`. Ledger / Trezor / WalletConnect are opt-in — pass them in
`modules` (Ledger needs a `Buffer` polyfill; Trezor / WalletConnect need
constructor params).

**SSR:** `stellarWalletsKitAdapters()` returns `[]` when `window` is undefined.
Under Next.js / Remix, construct the client on the client side (mounted flag or
`dynamic(..., { ssr: false })`).

**Also exported:** `StellarWalletsKitAdapter` (the class, for direct use) and
the types `KitPickerOptions`, `StellarWalletsKitAdapterOptions`.

***

`@pollar/privy-adapter` [#pollarprivy-adapter]

Client-side [Privy](https://privy.io) adapter. It drives the **whole** Privy
flow itself — email / Google / GitHub login, creating the user's **Privy
embedded Stellar wallet**, and raw-hash signing — then hands the signature to
Pollar for the standard SEP-10 login + transaction flow. You configure it once;
you do **not** wire up Privy's hooks yourself.

| Host                          | Status          | Signing engine         |
| ----------------------------- | --------------- | ---------------------- |
| React (web)                   | ✅ supported     | `@privy-io/react-auth` |
| React Native / Expo           | ✅ supported     | `@privy-io/expo`       |
| Angular, Vue, Svelte, vanilla | ❌ not supported | — (no Privy SDK)       |

In a non-React host it throws `PrivyAdapterUnsupportedError` on first use. For
those frameworks, sign server-side with `@pollar/privy-server-adapter` instead.

```bash
# web
npm i @pollar/privy-adapter @pollar/core @stellar/stellar-sdk @privy-io/react-auth react react-dom
```

Create the adapter, wrap your tree in `PrivyAdapterProvider`, and register it on
the client:

```tsx
import { createPrivyAdapter, PrivyAdapterProvider } from '@pollar/privy-adapter';
import { PollarProvider } from '@pollar/react';

const privy = createPrivyAdapter({
  appId: 'your-privy-app-id',
  loginMethods: ['email', 'google', 'github'],
});

export function App() {
  return (
    <PrivyAdapterProvider adapter={privy}>
      <PollarProvider client={{ apiKey: 'pub_testnet_…', walletAdapters: [privy] }}>
        {/* your app */}
      </PollarProvider>
    </PrivyAdapterProvider>
  );
}
```

This renders a **Privy** button in the login modal that opens a sub-modal with
the `loginMethods` you configured. `login({ provider: 'privy' })` also works
directly. On React Native / Expo the code is identical — the import resolves to
the `@privy-io/expo` build.

`createPrivyAdapter(config)` [#createprivyadapterconfig]

| Field                   | Type                                  | Notes                                                                     |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| `appId`                 | `string`                              | Your Privy app id.                                                        |
| `loginMethods`          | `('email' \| 'google' \| 'github')[]` | Options shown in the sub-modal, in order.                                 |
| `clientId?`             | `string`                              | Privy app client id, if your app uses one.                                |
| `appearance?`           | `{ theme?; accentColor?; logo? }`     | Forwarded to Privy's surfaces (web only; ignored on React Native).        |
| `debug?`                | `boolean`                             | Verbose `[privy-adapter]` logging. Off by default.                        |
| `cleanupOAuthRedirect?` | `boolean`                             | Strip `privy_oauth_*` params from the URL after web OAuth. On by default. |
| `meta?`                 | `{ label; iconUrl? }`                 | Login button. Defaults to `{ label: 'Privy' }`.                           |

**Also exported:** `PrivyAdapterProvider`, `PrivyAdapterUnsupportedError`, and
types `PollarPrivyConfig`, `PollarPrivyAppearance`, `PrivyLoginMethod`,
`AuthOption`, `InteractiveAuthAdapter`, `PrivyRuntime`.

> `@pollar/react`'s provider auto-syncs a persisted Privy session on load and
> recovers a web OAuth redirect, so the user does not have to click the login
> button again.

***

Server-side and transaction adapters [#server-side-and-transaction-adapters]

Two more first-party adapters exist for narrower cases:

* **`@pollar/privy-server-adapter`** — server-side Privy custody (signing through
  your Privy app secret on your backend), for non-React hosts or backend flows.
* **`@pollar/accesly-adapter`** — a transaction-building adapter registered via
  the separate `adapters` prop on `PollarProvider` (not `walletAdapters`) and
  driven with `createPollarAdapterHook`.

Both are published at 0.10.1.


# Webhooks



Pollar uses webhooks in two directions:

* **Inbound** — your backend receives a call from Pollar when an event occurs

* **Outbound** — your backend calls Pollar to trigger an action (e.g. `POST /v1/wallets/activate`)

***

Inbound webhooks `upcoming` [#inbound-webhooks-upcoming]

> 🚧 &#x2A;*Not yet available.** Inbound event webhooks are on the roadmap and **not implemented in production yet**. The dashboard configuration page is gated behind a "coming soon" state, and the semantic events, signature convention, and retry schedule documented below describe the **planned** design so you can prepare your integration — they are not live.
>
> What exists today is an internal, generic on-chain delivery: a single `stellar.tx` event carrying raw Stellar operation data, posted once (no retry/backoff) with an `X-Pollar-Signature: sha256=<hmac>` header. The structured `wallet.*` / `payment.*` events below are not emitted yet.

When available, you'll configure a webhook URL in **Build → Webhooks**. Pollar sends a `POST` request to your URL when an event occurs.

Authentication [#authentication]

Every request includes an `X-Pollar-Signature` header — an HMAC-SHA256 signature of the raw request body using your webhook secret.

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}

// Next.js API route
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('x-pollar-signature') ?? '';

  if (!verifyWebhook(payload, signature, process.env.POLLAR_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);
  // handle event...
  return NextResponse.json({ received: true });
}
```

Always respond with `200` as quickly as possible. If your endpoint returns a non-2xx status or times out, Pollar retries with exponential backoff.

Retry policy `upcoming` [#retry-policy-upcoming]

> Planned design — there is **no retry/backoff implemented today**. The current internal delivery posts once and logs failures.

| Attempt | Delay      |
| ------- | ---------- |
| 1       | Immediate  |
| 2       | 1 minute   |
| 3       | 10 minutes |
| 4       | 1 hour     |
| 5       | 24 hours   |

After 5 failed attempts the event is marked as failed and visible in **Build → Webhooks → Event log**.

***

Events `upcoming` [#events-upcoming]

> These semantic event types are **planned, not yet emitted**. The server currently only delivers a generic `stellar.tx` payload with raw operation data.

`wallet.created` [#walletcreated]

Fired when a new wallet G-address is created on-chain.

```json
{
  "event": "wallet.created",
  "timestamp": "2026-03-15T10:00:00Z",
  "data": {
    "walletId": "wal_abc123",
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "status": "pending"
  }
}
```

`wallet.activated` [#walletactivated]

Fired when a wallet is successfully funded and active on-chain.

```json
{
  "event": "wallet.activated",
  "timestamp": "2026-03-15T10:30:00Z",
  "data": {
    "walletId": "wal_abc123",
    "address": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "activatedAt": "2026-03-15T10:30:00Z"
  }
}
```

`wallet.funded` [#walletfunded]

Fired when `fund()` distributes assets from the distribution wallet.

```json
{
  "event": "wallet.funded",
  "timestamp": "2026-03-15T11:10:00Z",
  "data": {
    "walletId": "wal_abc123",
    "asset": "USDC",
    "amount": "100.00",
    "txHash": "c3d4e5f6..."
  }
}
```

`payment.sent` [#paymentsent]

Fired when a payment is confirmed on-chain.

```json
{
  "event": "payment.sent",
  "timestamp": "2026-03-15T11:00:00Z",
  "data": {
    "txHash": "a1b2c3d4...",
    "fromWalletId": "wal_abc123",
    "from": "GABC...",
    "to": "GXYZ...",
    "asset": "USDC",
    "amount": "10.00",
    "ledger": 1234567
  }
}
```

`payment.received` [#paymentreceived]

Fired when a wallet receives a payment from any Stellar address.

```json
{
  "event": "payment.received",
  "timestamp": "2026-03-15T11:05:00Z",
  "data": {
    "txHash": "b2c3d4e5...",
    "toWalletId": "wal_abc123",
    "from": "GXYZ...",
    "to": "GABC...",
    "asset": "USDC",
    "amount": "25.00",
    "ledger": 1234600
  }
}
```

`trustline.added` [#trustlineadded]

Fired when a trustline is enabled on a user wallet.

```json
{
  "event": "trustline.added",
  "timestamp": "2026-03-15T10:01:00Z",
  "data": {
    "walletId": "wal_abc123",
    "asset": "USDC"
  }
}
```

`sponsor.balance.low` [#sponsorbalancelow]

Fired when any sponsorship wallet drops below its configured minimum threshold.

```json
{
  "event": "sponsor.balance.low",
  "timestamp": "2026-03-15T12:00:00Z",
  "data": {
    "walletType": "funding",
    "address": "GSPONSOR...",
    "balance": "5.00",
    "threshold": "10.00",
    "asset": "XLM"
  }
}
```

***

Outbound webhooks [#outbound-webhooks]

Your backend calls Pollar to trigger actions. Currently:

* `POST /v1/wallets/activate` — see [Server API](https://docs.pollar.xyz/docs/sdk-reference/server-api)


# API Keys



**Dashboard → Build → API Keys**

***

Key types [#key-types]

| Type        | Prefix         | Network | Use                                     |
| ----------- | -------------- | ------- | --------------------------------------- |
| Publishable | `pub_testnet_` | Testnet | Frontend only (safe to expose)          |
| Publishable | `pub_mainnet_` | Mainnet | Frontend only (safe to expose)          |
| Secret      | `sec_testnet_` | Testnet | Backend only (never expose client-side) |
| Secret      | `sec_mainnet_` | Mainnet | Backend only (never expose client-side) |

**Publishable keys** are passed to `@pollar/core` or `@pollar/react` in your frontend. They can only initiate user-authenticated operations.

**Secret keys** are used in your backend for privileged endpoints like `POST /v1/wallets/activate`. Never expose them client-side.

> The key's network (testnet/mainnet) follows the **app's** network — it is not chosen per key. The prefix simply reflects the app environment the key belongs to.

***

Generating a key [#generating-a-key]

1. Click **Generate key**
2. Select the type (Publishable or Secret)
3. Copy the key immediately — secret keys are only shown once

***

Rotating a key [#rotating-a-key]

There is no dedicated "rotate" action — rotate by generating a replacement and deleting the old one:

1. **Generate** a new key of the same type
2. Update your environment variables to the new key
3. **Delete** the old key — requests using it then fail with `API_KEY_NOT_FOUND`

Rotate your secret key immediately if you suspect it has been exposed.

***

Key permissions [#key-permissions]

| Operation        | Publishable | Secret |
| ---------------- | ----------- | ------ |
| Login / logout   | ✓           | ✓      |
| Send payment     | ✓           | ✓      |
| Get wallet       | ✓           | ✓      |
| Get history      | ✓           | ✓      |
| Activate wallet  | —           | ✓      |
| Get app config   | —           | ✓      |
| List all wallets | —           | ✓      |

***

Multiple keys [#multiple-keys]

You can generate multiple keys of the same type — useful for separate deployment environments (staging, production) or rotating keys without downtime.

All active keys are listed with their creation date and last used timestamp.

***

Security checklist [#security-checklist]

* Never commit keys to version control — use environment variables
* Never prefix secret keys with `NEXT_PUBLIC_` or `VITE_`
* Use separate keys for testnet and mainnet
* Rotate keys periodically and immediately after any suspected exposure


# Branding



**Dashboard → Build → Branding**

Customize the appearance of the SDK login modal — the pre-built `WalletButton` / login component from `@pollar/react`.

***

What you can customize [#what-you-can-customize]

| Setting           | Description                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Theme**         | Modal appearance: **Light** or **Dark**                                                                               |
| **Accent color**  | Main modal color (default `#005DB4`)                                                                                  |
| **Logo**          | Logo displayed in the login modal (PNG, JPG, SVG, WEBP — max 1 MB)                                                    |
| **Login methods** | Toggle **Email** login on/off. **Social providers** are marked *Coming soon* and are not individually toggleable yet. |
| **Wallets**       | **Embedded wallets** and &#x2A;*Smart Wallet (passkey)** options                                                      |

> App name is edited in **Build → Settings**, not here.

***

Preview [#preview]

The Dashboard shows a live preview of the branded surfaces as you make changes, with tabs for **Login**, **KYC**, **Transaction**, **Tx History**, **Balance**, **Ramp**, and **Button**. You can also **Export configuration**.

Changes apply immediately — no SDK update or redeployment required.


# Domains



**Dashboard → Build → Domains**

Configure the allowed origins so the Pollar SDK can make requests from your app. Requests from unlisted origins are rejected.

***

Adding a domain [#adding-a-domain]

Click **Add domain** and enter your origin including the protocol:

```
http://localhost:3000
https://yourapp.com
https://staging.yourapp.com
```

Changes take effect immediately — no redeployment required.

***

Common issues [#common-issues]

**SDK throws `Origin not allowed`**
Your app's domain is not in the allowed list. Add it in **Dashboard → Build → Domains**.

**Localhost not working**
Add `http://localhost:3000` (or your local port) explicitly. Wildcard subdomains are not supported.

**Staging environment blocked**
Add each environment URL separately — `https://staging.yourapp.com`, `https://preview.yourapp.com`, etc.


# Members



**Dashboard → Build → Members**

Manage who can access this app in the Dashboard.

> **Everyone can view** the member list. Only the **owner** sees the management controls (invite / remove); for non-owners the section is read-only.

Use it to add or remove team members as your project grows. Account-level settings (your profile, billing) live outside the per-app sidebar.


# Settings



**Dashboard → Build → Settings**

General configuration for your Pollar app.

***

Application name [#application-name]

The display name for your app. Shown in the Dashboard and in the `WalletButton` modal header.

***

Application state & network [#application-state--network]

Shows whether this app is configured for **Testnet** or **Mainnet**, and the app's state. Network is set at app creation and **cannot be changed** — to use a different network, create a new app (or use the network selector in the top navigation bar to switch between your Testnet and Mainnet environments).

> Allowed origins are **not** configured here. They live under **Build → Domains**.

***

Auth settings [#auth-settings]

Control the lifetimes of the tokens the SDK issues to end-users:

* **Access token TTL** — in minutes (bounded by server-side limits).
* **Refresh token TTL** — in days (bounded by server-side limits).

Leave a field empty to use the platform default.

***

App ID [#app-id]

The app's identifier, used to associate your Pollar client with this app. Read-only.

***

> To remove an app, use **Danger Zone → Archive app**. Archiving disables the app's API keys and SDK access and is reversible (unarchive). There is no permanent "delete" action.


# Webhooks `upcoming`



**Dashboard → Build → Webhooks**

> 🚧 &#x2A;*Not yet available.** The Webhooks page exists in the dashboard but is gated behind a "coming soon" state — endpoints cannot be delivered to in production yet. Event types, signature verification, and the retry policy below describe the **planned** design. See the [Webhooks reference](https://docs.pollar.xyz/docs/sdk-reference/webhooks) for the current internal behavior.

Configure URLs where Pollar sends event notifications when things happen in your app.

***

Adding a webhook endpoint [#adding-a-webhook-endpoint]

1. Click **Add endpoint**
2. Enter your URL (must be HTTPS in production)
3. Select which events to receive
4. Copy the **Webhook secret** — used to verify incoming requests

***

Verifying webhook signatures [#verifying-webhook-signatures]

Every request includes an `X-Pollar-Signature` header. Verify it before processing:

```typescript
import { createHmac } from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return `sha256=${expected}` === signature;
}
```

Always respond with `200` immediately. Pollar retries failed deliveries with exponential backoff — see [Webhooks reference](https://docs.pollar.xyz/docs/sdk-reference/webhooks) for the full retry policy and event formats.

***

Event log [#event-log]

**Dashboard → Build → Webhooks → Event log** shows every delivery attempt — timestamp, event type, response code, and latency. Use this to debug failed deliveries or verify that events are being received correctly.


# Archive app



**Dashboard → Danger Zone → Archive app**

Irreversible-feeling but reversible actions for the app. **Owner only** — only the app owner sees and can perform these actions.

***

Archive application [#archive-application]

Archiving an app **disables all of its API keys and SDK access entirely** and hides it from collaborators. Existing user wallets on the Stellar network are unaffected — they exist independently on-chain.

Archiving is confirmed with an explicit prompt. Once archived, the app shows an **Archived** badge and a notice that its keys and SDK access are disabled.

Unarchive [#unarchive]

Archiving is **reversible**: use **Unarchive app** to restore the app and re-enable its API keys and SDK access.

> There is no permanent "delete app" action. Archive is the way to take an app out of service.


# Authentication



**Dashboard → Integrations → Authentication**

> 🚧 The per-app provider **configuration UI is upcoming** (the dashboard page is currently a "coming soon" stub). The providers below reflect what `login()` supports today.

Configure which authentication providers are available to your users.

***

Supported providers [#supported-providers]

| Provider               | Type                                           | Setup required                       |
| ---------------------- | ---------------------------------------------- | ------------------------------------ |
| **Google**             | OAuth 2.0                                      | None — Pollar handles the OAuth flow |
| **GitHub**             | OAuth 2.0                                      | None — Pollar handles the OAuth flow |
| **Email OTP**          | One-time password                              | None — Pollar sends the OTP email    |
| **External wallet**    | Freighter / Albedo built-in; more via adapters | Connects an existing Stellar wallet  |
| **Discord** `upcoming` | OAuth 2.0                                      | Not yet supported by `login()`       |

Today `login()` accepts `google`, `github`, `email`, and any registered **wallet adapter** id. Freighter and Albedo are built-in (`login({ provider: WalletType.FREIGHTER })`); you can add every Stellar Wallets Kit wallet and Privy embedded wallets through the SDK's `walletAdapters` option — see [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters). **Discord** (and other social providers such as Apple/X seen in config) are **not implemented yet** — they are inert until the provider work ships. Only enabled, supported providers appear in the `WalletButton` modal and are accepted by `login()`.

***

Email OTP flow [#email-otp-flow]

<Mermaid
  chart="%%{init: {'theme':'base', 'themeVariables': { 'primaryColor':'#005EB3','primaryTextColor':'#FDFEFE','primaryBorderColor':'#005EB3','lineColor':'#005EB3','secondaryColor':'#A2D1ED','tertiaryColor':'#A2D1ED','actorBkg':'#005EB3','actorBorder':'#005EB3','actorTextColor':'#FDFEFE','actorLineColor':'#005EB3','signalColor':'#005EB3','signalTextColor':'#000','labelBoxBkgColor':'#A2D1ED','labelBoxBorderColor':'#005EB3','labelTextColor':'#000','loopTextColor':'#000','noteBorderColor':'#005EB3','noteBkgColor':'#FDFEFE','noteTextColor':'#000','activationBorderColor':'#005EB3','activationBkgColor':'#A2D1ED','sequenceNumberColor':'#FDFEFE'}}}%%
sequenceDiagram
    actor User as End User
    participant UI as Pollar SDK
    participant API as Pollar API
    Note left of UI: State: idle

    User->>+UI: Click login (email)
    Note left of UI: State: creating_session
    UI->>+API: POST /session
    API-->>-UI: return session_id

    Note left of UI: State: entering_email
    UI-->>-User: Display email input field

    User->>+UI: Submit email address
    Note left of UI: State: sending_email
    UI->>+API: POST /email {session_id, address}

    Note over API: Generate & send verification code

    API-->>-UI: Code sent confirmation

    Note left of UI: State: entering_code
    UI-->>-User: Display verification code input

    User->>+UI: Submit verification code
    Note left of UI: State: verifying_email_code
    UI->>+API: POST /verify {session_id, code}

    Note over API: Validate code

    API-->>-UI: Verification successful

    Note left of UI: State: authenticating
    UI->>+API: GET /login {session_id} (with event streaming)

    Note over API: Authentication Process<br/>━━━━━━━━━━━━━━━━<br/>1. Validate session<br/>2. Resolve wallet (find or create)<br/>3. Verify minimum funding<br/>4. Verify trustlines<br/>5. Generate JWT token

    API-->>-UI: event: authenticated returning JWT
    Note over UI: Store JWT
    Note left of UI: State: authenticated
    UI-->>-User: Authentication complete"
/>

What the user sees at each state [#what-the-user-sees-at-each-state]

| State                  | What the user sees                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `idle`                 | `WalletButton` — the login entry point                                               |
| `creating_session`     | `LoginModal` opens with a centered spinner and label "Initializing..."               |
| `entering_email`       | `LoginModal` shows an email input field and a "Continue" button                      |
| `sending_email`        | "Continue" button is disabled with an inline spinner — label changes to "Sending..." |
| `entering_code`        | `LoginModal` shows a 6-digit OTP input field and a "Verify" button                   |
| `verifying_email_code` | "Verify" button is disabled with an inline spinner — label changes to "Verifying..." |
| `authenticating`       | `LoginModal` shows a centered spinner and label "Authenticating..."                  |
| `authenticated`        | `LoginModal` shows a success message — closes automatically after a few seconds      |

***

OAuth flow (Google, GitHub) [#oauth-flow-google-github]

OAuth providers follow the standard authorization code flow. When `login({ provider: 'google' })` is called:

1. `LoginModal` opens briefly with a spinner — "Redirecting..."
2. The browser redirects to the provider's consent screen
3. After the user approves, the provider redirects back to your app
4. `LoginModal` reopens with a spinner — "Authenticating..."
5. The same five internal steps run (see below)
6. `LoginModal` shows a success message and closes

***

What happens during authentication [#what-happens-during-authentication]

After credentials are verified — whether via OTP code or OAuth callback — the Pollar API runs five steps before issuing the JWT:

1. **Validate session** — confirms the session ID is valid and not expired
2. **Resolve wallet** — finds the existing wallet for this user, or creates a new one on first login
3. **Verify minimum funding** — checks the wallet has the minimum XLM reserve (Immediate mode only)
4. **Verify trustlines** — ensures all assets configured in the Dashboard are enabled on the wallet
5. **Generate JWT** — issues a signed token that the SDK stores and uses for subsequent requests

This sequence is identical for all providers.

***

Custom OAuth app `coming soon` [#custom-oauth-app-coming-soon]

By default, Pollar uses its own OAuth credentials for Google and GitHub. You can configure your own OAuth app credentials for a fully branded experience — users will see your app name in the OAuth consent screen instead of Pollar's.


# KYC `upcoming`



**Dashboard → Integrations → KYC**

> 🚧 &#x2A;*Not yet available.** The KYC configuration page is gated behind a "coming soon" state in the dashboard.

Connect identity-verification providers so you can gate features — for example, activating a wallet in [Deferred](https://docs.pollar.xyz/docs/core-concepts/funding-modes) mode only after a user passes KYC.

The SDK side already exists: `getClient().getKycProviders()`, `startKyc()`, and `getKycStatus()` from [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core), plus `openKycModal()` from [`@pollar/react`](https://docs.pollar.xyz/docs/sdk-reference/pollar-react). What's upcoming is the per-app provider configuration UI here.


# Pollar Pay



**Dashboard → Integrations → Pollar Pay**

Configure the Pollar Pay integration for your app — Pollar's payments layer for collecting payments into your app.

Use this section to enable and manage Pollar Pay for the current app. Details and the full payment flow are documented separately as the feature matures.


# Ramps



**Dashboard → Integrations → Ramps**

Configure fiat on/off-ramp providers so users can deposit and withdraw real money directly in your app via a modal.

***

Fiat Ramps [#fiat-ramps]

Enable a provider, add its credentials, and select the corridors/assets to support.

Supported providers [#supported-providers]

| Provider      | Type              | Notes                          |
| ------------- | ----------------- | ------------------------------ |
| **Bridge**    | REST (bridge.xyz) | Fiat corridors incl. BRL / Pix |
| **Etherfuse** | REST              | MXN ↔ USDC-on-Stellar          |
| **Anclap**    | SEP-24            | USDC and local stablecoins     |

Each provider is configured with its own credentials (base URL + API keys) and, where applicable, its enabled corridors. Assets you enable must also be configured in [Tokens / Trustlines](https://docs.pollar.xyz/docs/operator-guide/treasury/tokens-trustlines).

Once enabled, the ramp modal is available via `openRampModal()` in the SDK:

```tsx
const { openRampModal } = usePollar();

<button onClick={openRampModal}>
  Deposit / Withdraw
</button>
```

For headless control over quotes and on/off-ramp creation, use `getClient().getRampsQuote()`, `createOnRamp()`, and `createOffRamp()`.

***

More integrations `coming soon` [#more-integrations-coming-soon]

| Integration   | Description                                                                         |
| ------------- | ----------------------------------------------------------------------------------- |
| KYC providers | Connect Jumio, Persona, or Sumsub to trigger Deferred mode activation automatically |
| Analytics     | Send wallet and payment events to Mixpanel, Amplitude, or Segment                   |


# Wallets



**Dashboard → Integrations → Wallets** `hidden`

> 🚧 This section is **currently hidden from the dashboard**. It configured a server-side wallet provider / adapter (bring-your-own custody). The server-side custodian backend is intentionally kept, and the section will return when the next server-side adapter integration ships.

For **client-side** wallet login today — connecting external Stellar wallets (Freighter, Albedo, xBull, Lobstr, …) or Privy embedded wallets — you register adapters on the SDK, not in the dashboard. See [Wallet Adapters](https://docs.pollar.xyz/docs/sdk-reference/wallet-adapters).

By default, Pollar provisions built-in **custodial** wallets (social / email login, platform-custodied G-address); no configuration is required.

> Not to be confused with **Users → Wallets**, which lists the actual end-user wallets created in your app.


# Alerts



**Dashboard → Monitor → Alerts** `upcoming`

Configure notifications for low wallet balances so you never run out of funds unexpectedly.

***

Alert channels [#alert-channels]

| Channel     | Setup                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| **Email**   | Add one or more email addresses — alerts are sent when a threshold is crossed |
| **Webhook** | Add a webhook URL — Pollar sends a `sponsor.balance.low` event                |

***

Per-wallet thresholds [#per-wallet-thresholds]

Set independent thresholds for each operator wallet:

| Wallet              | Suggested threshold                  |
| ------------------- | ------------------------------------ |
| Funding wallet      | 20 XLM                               |
| Gas wallet          | 5 XLM                                |
| Distribution wallet | Depends on asset and expected volume |

When a wallet drops below its threshold, Pollar sends an alert immediately and repeats every 24 hours until the wallet is topped up.

***

`sponsor.balance.low` event [#sponsorbalancelow-event]

```json
{
  "event": "sponsor.balance.low",
  "timestamp": "2026-03-15T12:00:00Z",
  "data": {
    "walletType": "funding",
    "address": "GSPONSOR...",
    "balance": "5.00",
    "threshold": "10.00",
    "asset": "XLM"
  }
}
```

See [Webhooks](https://docs.pollar.xyz/docs/sdk-reference/webhooks) for the full event reference.


# Logs



**Dashboard → Monitor → Logs**

API request logs, errors, and webhook delivery history for your app.

***

API logs [#api-logs]

Every request made to the Pollar Server using your app's keys is logged:

| Column         | Description                                            |
| -------------- | ------------------------------------------------------ |
| **Timestamp**  | Request time                                           |
| **Endpoint**   | HTTP method and path                                   |
| **Key**        | Which API key made the request (publishable or secret) |
| **Status**     | HTTP response code                                     |
| **Latency**    | Response time in milliseconds                          |
| **Error code** | Pollar error code if the request failed                |

Logs are retained for **30 days**.

Filter by key, status code, endpoint, or date range. Use this to:

* Audit which key made which request

* Identify unauthorized usage after a key is compromised

* Debug integration issues

***

Webhook delivery logs [#webhook-delivery-logs]

Every webhook delivery attempt is logged with the event type, destination URL, response code, and latency. Failed deliveries show the error and retry schedule.

Access webhook logs from **Dashboard → Build → Webhooks → Event log**.


# Transactions



**Dashboard → Monitor → Transactions**

A real-time view of all on-chain transactions across your app.

***

Transaction list [#transaction-list]

| Column            | Description                                        |
| ----------------- | -------------------------------------------------- |
| **Tx hash**       | Stellar transaction hash — links to Stellar Expert |
| **Type**          | `payment`, `activation`, `trustline`, `receive`    |
| **Asset**         | Asset code                                         |
| **Amount**        | Transaction amount                                 |
| **From / To**     | Stellar G-addresses involved                       |
| **Fee sponsored** | Whether your gas wallet paid the fee               |
| **Ledger**        | Stellar ledger number                              |
| **Timestamp**     | Confirmation time                                  |

Filter by type, asset, date range, or wallet ID. Export as CSV.

***

Transaction detail [#transaction-detail]

Click any transaction to see the full details including the raw Stellar transaction envelope and a link to Stellar Expert for on-chain verification.


# Get started



**Dashboard → Overview → Get started**

A guided checklist shown on new apps that walks you through everything needed before going live. It tracks your progress and hides itself once your app is set up.

Typical steps:

1. **Generate API keys** — create a publishable key to connect your SDK ([API Keys](https://docs.pollar.xyz/docs/operator-guide/build/api-keys))
2. **Add allowed origins** — so the SDK can call Pollar from your app ([Domains](https://docs.pollar.xyz/docs/operator-guide/build/domains))
3. **Fund your app wallet** — your funding wallet needs XLM to create user wallets ([Account Funding](https://docs.pollar.xyz/docs/operator-guide/treasury/account-funding))
4. **Enable assets** — configure at least one token so user wallets can hold it ([Tokens & Trustlines](https://docs.pollar.xyz/docs/operator-guide/treasury/tokens-trustlines))
5. **Install the SDK and create your first wallet** — confirm the integration end-to-end ([Quickstart](https://docs.pollar.xyz/docs/getting-started/quickstart))


# Home



**Dashboard → Overview → Home**

The per-app landing page. It surfaces your app's key status at a glance — environment (testnet/mainnet), API keys, configured assets, and recent activity — with shortcuts into the sections you use most.

Each app you create has its own Home; switch apps from the top navigation bar.


# Account Funding



**Dashboard → Treasury → Account Funding**

Manage your app's **funding wallet** — the Stellar account that covers the XLM reserve required to create and activate new user wallets. This page is where you view its balance, copy its address, and top it up.

Pollar uses a set of operator wallets to cover costs on behalf of your users; each role has its own Treasury page:

| Wallet                  | Treasury page                                                                                 | Role                                                         | Charged when               |
| ----------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------- |
| **Funding wallet**      | Account Funding (this page)                                                                   | Covers the XLM reserve required to activate new user wallets | Once per wallet activation |
| **Gas wallet**          | [Sponsorship](https://docs.pollar.xyz/docs/operator-guide/treasury/sponsorship)               | Pays transaction fees for all on-chain operations            | Every transaction          |
| **Distribution wallet** | [Token Distribution](https://docs.pollar.xyz/docs/operator-guide/treasury/token-distribution) | Sends assets to users via claimable distribution rules       | Every claim                |

By default a single wallet is created when you create your app and covers all three roles. You can configure separate wallets for each role as your app scales.

***

Funding a wallet [#funding-a-wallet]

Option 1 — Send directly to the G-address [#option-1--send-directly-to-the-g-address]

Copy the wallet's Stellar G-address and send XLM or assets from any Stellar wallet or exchange.

Option 2 — Fund from the Dashboard [#option-2--fund-from-the-dashboard]

Click **Fund wallet** in the Dashboard, connect your Stellar wallet, and send funds with a single click.

***

Recommended minimum balances [#recommended-minimum-balances]

| Wallet              | Recommended minimum                                           |
| ------------------- | ------------------------------------------------------------- |
| Funding wallet      | 50 XLM (\~25 wallet activations with 2 assets each)           |
| Gas wallet          | 10 XLM                                                        |
| Distribution wallet | Depends on configured assets and expected distribution volume |

Configure low-balance alerts in [Alerts](https://docs.pollar.xyz/docs/operator-guide/monitor/alerts) so you are notified before running out of funds.

***

XLM reserve cost per wallet activation [#xlm-reserve-cost-per-wallet-activation]

The cost to activate a user wallet depends on how many assets are configured in [Tokens / Trustlines](https://docs.pollar.xyz/docs/operator-guide/treasury/tokens-trustlines):

`1 XLM + (number of configured assets × 0.5 XLM)`

| Assets configured    | Reserve required |
| -------------------- | ---------------- |
| 0                    | 1 XLM            |
| 1 (e.g. USDC)        | 1.5 XLM          |
| 2 (e.g. USDC + EURC) | 2 XLM            |
| 3                    | 2.5 XLM          |

Pollar does not charge extra — the full amount is consumed from your funding wallet.

> References: [Minimum Balance](https://developers.stellar.org/docs/learn/fundamentals/lumens#minimum-balance) · [Trustlines](https://developers.stellar.org/docs/learn/fundamentals/stellar-data-structures/accounts#trustlines)


# Auth Policy



**Dashboard → Treasury → Auth Policy**

Control which Soroban contracts a custodial wallet may **authorize**. This is the signing allowlist for Soroban authorization entries.

When your own contract sponsors gas and settles a transfer, the user signs only an authorization entry — Pollar signs it **only if every contract and function in it is allowlisted here**. A custodial wallet refuses to sign an authorization entry that touches any contract or function not on the list; that is what prevents the signer from being used to drain a user's funds.

***

Contract allowlist [#contract-allowlist]

Each row allowlists **one contract** and the **exact functions** a custodial wallet may authorize on it.

Include every contract in the call tree — your settlement contract and anything it sub-invokes (e.g. the AMM, the token). For each row you provide:

* **Contract** — the Soroban contract id.
* **Functions** — the specific function names allowed (e.g. `settle, swap`).
* **Label** — an optional human-readable name (e.g. `RouterV1 settlement`).

***

Allow any (bypass) [#allow-any-bypass]

An **allow-any** switch bypasses the allowlist entirely — every contract and function is authorized and the list below is ignored. Use only if you fully control transaction construction; an explicit allowlist is strongly preferred.


# Earn



**Dashboard → Treasury → Earn**

Choose which yield providers your users can access to earn on their balances. &#x2A;*If no provider is enabled, the Earn UI is hidden for your users.**

***

Providers [#providers]

| Provider     | Type          | Notes                                        |
| ------------ | ------------- | -------------------------------------------- |
| **DeFindex** | Yield vaults  | Requires a DeFindex API key (stored per app) |
| **Blend**    | Lending pools | Toggle on to expose Blend pools              |

Enable a provider and, where required, add its credentials (e.g. the DeFindex API key). You can add or remove the key from this page.

***

In the SDK [#in-the-sdk]

The providers configured here drive the client SDK:

* `getEarnProviders()` → enabled providers (empty = Earn disabled)
* `getEarnOpportunities(provider)` → vaults/pools with live APY
* `getEarnPosition(params)` → the wallet's position
* `earnDeposit(params)` / `earnWithdraw(params)` → move funds
* `openEarnModal()` (`@pollar/react`) → the pre-built Earn modal

See [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core) and [`@pollar/react`](https://docs.pollar.xyz/docs/sdk-reference/pollar-react).


# Funding Mode



**Dashboard → Treasury → Account Funding** (the funding-mode selector lives on the Account Funding page — there is no standalone "Funding Mode" page).

Controls when new user wallets are funded with their XLM reserve. Switch modes at any time without code changes — the new mode applies to all wallets created after the switch.

***

Modes [#modes]

| Mode          | Cost                        | Activation trigger        | Best for                                      |
| ------------- | --------------------------- | ------------------------- | --------------------------------------------- |
| **Immediate** | \~2 XLM per registration    | Automatic on login        | Apps without compliance requirements          |
| **Deferred**  | \~2 XLM per activation only | Webhook from your backend | Neobanks, remittance apps, KYC-gated products |

In both modes, any individual wallet can also be funded manually from **Dashboard → Users → Wallets** using the **Fund 2 XLM** action. This is useful as a fallback or for support workflows.

***

Immediate [#immediate]

The wallet is funded atomically at the moment the user logs in. Ready in under 3 seconds. No additional setup required.

***

Deferred [#deferred]

The G-address is created on-chain at registration but without an XLM reserve. Activation happens when your backend calls `POST /v1/wallets/activate` after a business event occurs (KYC approved, first deposit, etc.). See [Deferred Flow Guide](https://docs.pollar.xyz/docs/guides/deferred-flow-guide) for the full setup.


# Sponsorship



**Dashboard → Treasury → Sponsorship**

Controls which transactions your app sponsors and the limits applied per user. All rules are enforced server-side by the Pollar Server — they cannot be bypassed from the client SDK.

***

Sponsored transaction types [#sponsored-transaction-types]

Select which Stellar operation types are covered by your gas wallet:

| Type         | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `payment`    | Asset transfers between wallets                              |
| `trustline`  | Adding a new asset trustline to a wallet                     |
| `activation` | Account sponsorship sequence for new wallets                 |
| Custom       | Define rules based on asset, amount range, or other criteria |

Transactions of unselected types are rejected before reaching the Stellar network.

***

Per-user limits [#per-user-limits]

Prevent abuse by setting caps per user:

| Setting           | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `daily_ops_cap`   | Maximum sponsored operations per user per day                    |
| `max_fee_per_tx`  | Maximum fee the gas wallet will pay per transaction (in stroops) |
| `approved_assets` | Whitelist of assets eligible for fee sponsorship                 |

***

Custom rules `coming soon` [#custom-rules-coming-soon]

Define granular sponsorship rules — for example, only sponsor USDC payments under $100, or only sponsor trustlines for configured assets.


# Swap



**Dashboard → Treasury → Swap**

Choose which swap venues your users can use to exchange one asset for another.

***

Enabled venues [#enabled-venues]

Enable one or more DEX / AMM venues. **If none are enabled, the swap UI is hidden for your users** — `getSwapConfig()` returns an empty list and the SDK hides the swap surface.

***

Buy tokens [#buy-tokens]

Extra tokens your users can swap **into**, on top of your enabled assets. The catalog is curated by the platform; enable the ones you want to expose.

***

In the SDK [#in-the-sdk]

The venues and tokens configured here drive the client SDK:

* `getSwapConfig()` → enabled venues (empty = swap disabled)
* `getSwapTokens()` → the buy-token catalog
* `getSwapQuote(params)` / `swap(quote)` → quote and execute
* `openSwapModal()` (`@pollar/react`) → the pre-built swap modal

See [`@pollar/core`](https://docs.pollar.xyz/docs/sdk-reference/pollar-core) and [`@pollar/react`](https://docs.pollar.xyz/docs/sdk-reference/pollar-react).


# Token Distribution



**Dashboard → Treasury → Token Distribution**

Configures **distribution rules** — assets your app makes available from its distribution wallet for users to claim. Users claim them from the SDK (`openDistributionRulesModal()`, or `getClient().listDistributionRules()` / `claimDistributionRule()`).

***

Distribution rules [#distribution-rules]

Create a rule per asset you want to distribute. Only assets enabled here can be claimed — claiming an unconfigured asset returns `DISTRIBUTION_ASSET_NOT_ENABLED`.

For each rule, configure:

| Setting              | Description                                           |
| -------------------- | ----------------------------------------------------- |
| **Asset**            | The asset to distribute (must be enabled for the app) |
| **Amount per claim** | How much a user receives per claim                    |
| **Validity window**  | When the rule starts/ends (claims outside it fail)    |
| **Rate limit**       | Max claims per user per period                        |

Relevant errors: `DISTRIBUTION_RULE_NOT_FOUND`, `DISTRIBUTION_RULE_DISABLED`, `DISTRIBUTION_RULE_NOT_STARTED`, `DISTRIBUTION_RULE_EXPIRED`, `DISTRIBUTION_RULE_EXHAUSTED`, `DISTRIBUTION_RATE_LIMIT_EXCEEDED`.

***

Distribution wallet [#distribution-wallet]

Claims are paid from the app's **distribution wallet**. If none is configured, claims fail with `DISTRIBUTION_NO_DISTRIBUTION_WALLET`. Fund it by sending assets directly to its G-address, or via the **Fund wallet** button in [App Wallets](https://docs.pollar.xyz/docs/operator-guide/treasury/account-funding).


# Tokens & Trustlines



**Dashboard → Treasury → Tokens & Trustlines**

Configure which assets are automatically enabled on new user wallets at creation or activation.

***

How it works [#how-it-works]

When a user wallet is created or activated, Pollar automatically sets up a trustline for each asset configured here. Users never need to manually enable assets.

Each trustline adds **0.5 XLM** to the wallet's reserve cost — charged from your funding wallet. See [App Wallets](https://docs.pollar.xyz/docs/operator-guide/treasury/account-funding) for the full cost breakdown.

***

Adding an asset [#adding-an-asset]

1. Click **Add asset**
2. Enter the asset code (e.g. `USDC`) and issuer G-address
3. Click **Save**

The asset is enabled on all new wallets from this point. Existing wallets are not affected.

***

Common assets on Stellar [#common-assets-on-stellar]

| Asset | Issuer                                                     |
| ----- | ---------------------------------------------------------- |
| USDC  | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| EURC  | `GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP`  |
| AQUA  | `GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA` |

Always verify issuer addresses from the official asset issuer before adding.

***

Removing an asset [#removing-an-asset]

Removing an asset from the list stops it from being added to new wallets. Existing trustlines on active wallets are not removed — trustlines can only be removed by the wallet owner.


# Transaction Policy



**Dashboard → Treasury → Transaction Policy**

Control which sensitive Stellar operations custodial wallets are allowed to sign. Rules are enforced server-side — a custodial wallet refuses to sign anything the policy blocks.

***

Account merge [#account-merge]

`account_merge` transfers a wallet's entire balance to another account and **permanently deletes it on-chain**. It is **blocked by default**.

* **Allowed destinations** — an allowlist of `G…` addresses that `account_merge` may send to. Empty = account merge is fully blocked.
* **Allow any destination** — permits `account_merge` to send to any address. Dangerous: a client could sign a merge that drains and deletes the custodial wallet, sending all funds to an arbitrary address. Prefer an explicit allowlist; only enable this if you fully control how transactions are built.

***

Maximum transaction fee [#maximum-transaction-fee]

The highest total fee a custodial wallet may sign for a single transaction.

* **Max fee (XLM)** — allowed range **0.01 – 100 XLM**. Leave empty to use the **10 XLM** default.

Expensive Soroban contract calls (e.g. DeFindex / Blend deposits) can exceed the default — raise the cap to allow them, or lower it for stricter spend control.


# Accounts



**Dashboard → Users → Accounts**

Browse and manage all users who have authenticated through your app.

***

User list [#user-list]

| Column        | Description                                                                 |
| ------------- | --------------------------------------------------------------------------- |
| **User ID**   | Pollar user ID (`usr_...`)                                                  |
| **Email**     | User email — shown if authenticated via email OTP or OAuth with email scope |
| **Provider**  | Auth provider used (Google, GitHub, Email, external wallet)                 |
| **Wallet**    | Associated wallet ID and status                                             |
| **Created**   | First login timestamp                                                       |
| **Last seen** | Most recent activity                                                        |

Search by email or user ID. Filter by auth provider or wallet status.

***

User detail [#user-detail]

Click any user to see:

* Auth provider and login history
* Associated wallet — ID, G-address, status, and balances
* Full transaction history
* Option to manually fund/activate their wallet (the **Fund 2 XLM** action lives on **Users → Wallets** for not-yet-funded wallets)


# Wallets



**Dashboard → Users → Wallets**

Browse and manage all user wallets created through your app.

***

Wallet list [#wallet-list]

The wallet list shows every wallet associated with your app:

| Column        | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| **G-address** | Stellar public key — the wallet's identifier; links to Stellar Expert |
| **User**      | Associated user email or ID                                           |
| **Status**    | **Active** (funded on-chain) or **Not funded**                        |
| **Balances**  | Current asset balances                                                |
| **Created**   | Creation timestamp                                                    |

Filter by status, search by user email or address.

***

Funding a wallet manually [#funding-a-wallet-manually]

In Deferred mode, wallets start unfunded (**Not funded**). You can fund one from the Dashboard at any time:

1. Find the wallet in the list
2. Click **Fund 2 XLM** next to a **Not funded** wallet
3. The XLM reserve is funded from your funding wallet

The wallet moves to **Active** within \~2 seconds. (This is also the manual fallback for Immediate-mode wallets whose initial funding didn't complete.)

***

Wallet detail [#wallet-detail]

Click any wallet to see:

* Full transaction history
* Current balances per asset
* Activation timestamp
* Associated user
* Link to Stellar Expert for on-chain verification