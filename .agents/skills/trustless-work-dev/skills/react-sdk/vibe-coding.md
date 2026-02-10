# Vibe Coding Guide

In all of your chat prompts, you should provide the agent with specific document references, including the global content rules and the complete code project. ***GPT 5 gives the best result***

## Global Context

This document defines how the AI assistant should help with front-end development tasks. The global context below establishes the persona, expertise, and workflow patterns that should be followed in all interactions.

```markdown
---
alwaysApply: true
---
You are a **Senior Front-End Developer** and **Expert** in:
- ReactJS, NextJS, JavaScript, TypeScript
- TailwindCSS, Shadcn, Radix UI
- HTML, CSS, and modern UI/UX best practices

You are methodical, precise, and a master at reasoning through complex requirements. You always provide correct, DRY, bug-free, production-ready code.

## General Rules
- Follow the user's requirements **exactly** as stated.
- Think step-by-step:  
  1. **Analyze** the requirement.  
  2. **Write detailed pseudocode** describing the implementation plan.  
  3. **Confirm** the plan (if asked).  
  4. **Write complete code** that matches the plan.  
- Never guess. If something is unclear, ask for clarification.
- If an external library is mentioned, always refer to its official documentation before implementation.
- Always ensure the final code is fully functional, with no placeholders, `TODO`s, or missing parts.
- Prefer readability over performance.
- Use best practices for React & Next.js development.
- Do not use cd in order to access to determinate root, neither use &&, | or something like that in shell actions.
- Do not verify the build during the Trustless Work implementations.
- In each npm i, the name of the dependency must be enclosed in double quotation marks ("").
- Do not ask for 2 o more ways to implement, just do it the best way possible.
- Do not plan or ask for steps; just implement the code without asking questions.

## Trustless Work Integration Context
When working with Trustless Work:
- Documentation (I'll provide you the docs in the cursor docs management):  
  - React Library → <https://docs.trustlesswork.com/trustless-work/react-library>  
  - Wallet Kit → <https://docs.trustlesswork.com/trustless-work/developer-resources/stellar-wallet-kit-quick-integration>  
  - Types → <https://docs.trustlesswork.com/trustless-work/developer-resources/types>  
- Ensure proper installation and configuration before usage.
- Use provided Types from the documentation when applicable.
- Follow the API and component usage exactly as described in the docs.
- Do not use any, instead always you must search for the Trustless Work entities.

## Code Implementation Guidelines
- Use **TailwindCSS classes** for styling; avoid plain CSS.
- For conditional classes, prefer `clsx` or similar helper functions over ternary operators in JSX.
- Use **descriptive** variable, function, and component names.  
  - Event handlers start with `handle` (e.g., `handleClick`, `handleSubmit`).
- Prefer **const** arrow functions with explicit type annotations over `function` declarations.
- Always include all necessary imports at the top.
- Use early returns to improve code clarity.

## Verification Before Delivery
Before finalizing:
1. Check that all required imports are present.
2. Ensure the code compiles in a Next.js 14+ environment.
3. Confirm that Tailwind and Shadcn styles render correctly.
4. Verify that Trustless Work components or hooks are properly initialized.
5. Ensure TypeScript types are correct and there are no type errors.
```

## Prompts

Attach the Global Context and referenced documents to all prompts for clarity and consistency.

### 1 - Trustless Work - React Library Setup

Below are the essential steps to get started with the installation and basic configuration. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started)

{% hint style="info" %}
Ensure to set the API Key in a `.env` file during this step.
{% endhint %}

```markdown
Configure the initial setup to use the Trustless Work React library in a Next.js app.

- Install the required dependency.
- Set up the provider at the app root.
- Ensure all imports are correct.
- Use TypeScript if types are available in the documentation.
```

### 2 - Stellar Wallet Kit

This component builds on top of the base Trustless Work library to offer specialized wallet connectivity features. You should attach these links as docs reference: [Stellar Wallet Kit](https://docs.trustlesswork.com/trustless-work/developer-resources/stellar-wallet-kit-quick-integration)

```markdown
Configure the initial setup for the Stellar Wallet Kit in a Next.js app based on the documentation, please follow their indications.

- Install the required dependency.
- Ensure all imports are correct.
- Use TypeScript if types are provided.
- Make sure the wallet is ready to be used across the app.
- Implement the wallet hooks by using buttons.
```

### 3 - Initialize Escrow

This prompt will guide you through implementing the initialize escrow feature in a Next.js application using the Trustless Work library. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useInitializeEscrow function from the Trustless Work React library in our Next.js app.

- Use mock data for the payload values, except for the fields explicitly provided below.
- Add a button that initializes the escrow when clicked.
- Use multi-release mode.
- Use this USDC trustline address: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
- Use this symbol value: USDC
- For all roles, use the wallet address of the currently connected user.
- The payload type must be InitializePayload (as defined in the official payloads documentation: <https://docs.trustlesswork.com/trustless-work/introduction/developer-resources/types/payloads/deploy>).
- After sendTransaction returns, display the contractId on screen with a clickable link to view it in Stellar Viewer.
- Set platformFee to 4.
- Ensure TypeScript types are correct.
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

### 4 - Save Escrow in Global Store

This prompt will help you implement a global state management solution to store and access escrow data across your application. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Update the useInitializeEscrow implementation to handle the full response from sendTransaction.

- After calling sendTransaction, store the returned escrow object and the contractId in a React Context.
- Do not fetch the escrow from anywhere else; only use the one returned directly from sendTransaction.
- Example: const response = await sendTransaction(...); // response contains: { status, message, contractId, escrow }
- Create a section in the UI to visually display all the escrow properties, assuming the type is MultiReleaseEscrow.
- Ensure TypeScript types are correct.
```

### 5 - Fund Escrow

This prompt will guide you through implementing the fund escrow feature using the Trustless Work library in your Next.js application. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useFundEscrow hook from the Trustless Work React library to fund an existing escrow contract.

- Use the contractId stored in the React Context from the previous step.
- Use multi-release mode.
- Add a button that funds the escrow when clicked.
- The payload type must be FundEscrowPayload (as defined in the official payloads documentation).
- Include proper error handling and loading states.
- After successful funding, display a success message to the user.
- Ensure TypeScript types are correct and all imports are present.
- Display the transaction status and any relevant details returned from the hook.
- Update the escrow store in context.
- Do not add extra properties of FundEscrowPayload
- The amount must be the same number of the escrow amount, which it means that if we have 2 milestone of 5, the amount for the fund will be 10
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

### 6 - Change Milestone Status

This prompt will guide you through implementing the functionality to change milestone statuses in an escrow contract using the Trustless Work library. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useChangeMilestoneStatus hook from the Trustless Work React library to update milestone statuses in the multi-release escrow.

- Use the contractId and escrow data stored in the React Context.
- Use multi-release mode.
- Add UI components that allow selecting a milestone and changing its status.
- The payload type must be ChangeMilestoneStatusPayload (as defined in the official documentation).
- Implement separate buttons for each possible status transition (e.g., "Mark as Completed", "Reject", etc.).
- Only show status change options that are valid for the current milestone state.
- Include proper error handling and loading states.
- After successful status change, update the escrow data in the context.
- Ensure TypeScript types are correct and all imports are present.
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

### 7 - Approve Milestone

This prompt will guide you through implementing the approve milestone feature in your escrow workflow using the Trustless Work library. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useApproveMilestone hook from the Trustless Work React library to approve milestones in the multi-release escrow.

- Use the contractId and escrow data stored in the React Context.
- Use multi-release mode.
- Add UI components that allow selecting a milestone and approving it.
- The payload type must be ApproveMilestonePayload (as defined in the official documentation).
- Include proper error handling and loading states.
- After successful approval, update the escrow data in the context.
- Ensure TypeScript types are correct and all imports are present.
- Display a confirmation message after successful approval.
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

### 8 - Release Funds

This prompt will guide you through implementing the release funds feature in your escrow workflow using the Trustless Work library. This function allows clients to release funds to freelancers after milestone approval. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useReleaseFunds hook from the Trustless Work React library to release funds for approved milestones in the multi-release escrow.

- Use the contractId and escrow data stored in the React Context.
- Use multi-release mode.
- Add UI components that allow selecting a milestone and releasing funds for it.
- The payload type must be MultiReleaseReleaseFundsPayload (as defined in the official documentation).
- Include proper error handling and loading states.
- After successful fund release, update the escrow data in the context.
- Ensure TypeScript types are correct and all imports are present.
- Display a success message after funds are released successfully.
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

### 9 - Start Dispute

This prompt will guide you through implementing the start dispute feature in your escrow workflow using the Trustless Work library. This functionality allows parties to initiate a dispute process when disagreements arise. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useStartDispute hook from the Trustless Work React library to initiate disputes in the multi-release escrow.

- Use the contractId and escrow data stored in the React Context.
- Use multi-release mode.
- Add UI components that allow selecting a milestone and starting a dispute.
- The payload type must be MultiReleaseStartDisputePayload (as defined in the official documentation).
- Include proper error handling and loading states.
- After successfully starting a dispute, update the escrow data in the context.
- Ensure TypeScript types are correct and all imports are present.
- Display a confirmation after the dispute has been successfully initiated.
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

### 10 - Resolve Dispute

This prompt will guide you through implementing the resolve dispute feature in your escrow workflow using the Trustless Work library. This advanced functionality allows the arbiter to make a final decision on disputes, allocating funds accordingly. You should attach these links as docs reference: [React Library TW](https://docs.trustlesswork.com/trustless-work/react-library/getting-started) and [Types TW](https://docs.trustlesswork.com/trustless-work/developer-resources/types)

```markdown
Implement the useResolveDispute hook from the Trustless Work React library to resolve disputes in the multi-release escrow.

- Use the contractId and escrow data stored in the React Context.
- Use multi-release mode.
- Add UI components that allow selecting a milestone and resolving a dispute.
- The payload type must be MultiReleaseResolveDisputePayload (as defined in the official documentation).
- Include proper error handling and loading states.
- After successfully resolving a dispute, update the escrow data in the context.
- Ensure TypeScript types are correct and all imports are present.
- Display a confirmation message after the dispute has been successfully resolved.
- Make sure in the submit function, do these 3 steps always: execute function from tw, sign transaction with wallet and sendTransaction.
```

## Key Implementation Pattern

All hooks follow this 3-step pattern in the submit function:

1. **Execute function from TW** - Call the Trustless Work hook function
2. **Sign transaction with wallet** - Sign the returned unsigned transaction
3. **Send transaction** - Submit the signed transaction via `sendTransaction`

**Example:**

```tsx
const handleSubmit = async () => {
  // Step 1: Execute function from TW
  const { unsignedTransaction } = await initializeEscrow(payload);

  // Step 2: Sign transaction with wallet
  const signedTx = await wallet.signTransaction(unsignedTransaction);

  // Step 3: Send transaction
  const response = await sendTransaction({ xdr: signedTx });
  
  // Handle response (contains: { status, message, contractId, escrow })
};
```

## Important Notes

- Always use TypeScript types from Trustless Work documentation
- Never use `any` type - search for Trustless Work entities instead
- Store escrow data in React Context after `sendTransaction` returns
- Update context after each mutation (fund, approve, release, etc.)
- Use multi-release mode unless specified otherwise
- Include proper error handling and loading states
- Display success/error messages to users
- Follow the exact payload structure from documentation
