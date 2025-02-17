import { StrKey, Horizon, type Transaction } from "@stellar/stellar-sdk";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const server = new Horizon.Server(process.env.STELLAR_NETWORK_URL!);

export async function fetchAccount(publicKey: string) {
  if (!StrKey.isValidEd25519PublicKey(publicKey)) {
    throw new Error("Invalid public key");
  }

  try {
    return await server.accounts().accountId(publicKey).call();
  } catch (err) {
    if (err instanceof Error && "response" in err) {
      const response = (
        err as { response?: { status?: number; data?: { detail?: string } } }
      ).response;
      const status = response?.status ?? 400;
      const message = response?.data?.detail || err.message || "Unknown error";

      throw new Error(`${status} - ${message}`);
    }

    throw new Error("An unexpected error occurred");
  }
}

export async function submitTransaction(transaction: Transaction) {
  try {
    return await server.submitTransaction(transaction);
  } catch (err) {
    if (err instanceof Error && "response" in err) {
      const response = (
        err as {
          response?: {
            title?: string;
            data?: { extras?: { result_codes?: string } };
          };
        }
      ).response;
      const title = response?.title || "Transaction Error";
      const resultCodes =
        response?.data?.extras?.result_codes || "Unknown error";

      throw new Error(`${title} - ${resultCodes}`);
    }

    throw new Error(
      "An unexpected error occurred while submitting the transaction"
    );
  }
}

export async function fetchAccountBalances(publicKey: string) {
  const { balances } = await fetchAccount(publicKey);
  return balances;
}

export async function fetchRecentPayments(publicKey: string, limit = 10) {
  const { records } = await server
    .payments()
    .forAccount(publicKey)
    .limit(limit)
    .order("desc")
    .call();
  return records;
}
