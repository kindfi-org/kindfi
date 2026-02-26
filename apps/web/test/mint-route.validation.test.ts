import { describe, expect, test } from "bun:test";

// ✅ Must be at top level, before ANY imports or dynamic imports
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
process.env.NEXT_PUBLIC_KYC_API_BASE_URL = "http://localhost:3001";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret";

describe("NFT mint route validation helpers", () => {
  test("validateUUID accepts valid UUIDs and rejects invalid", async () => {
    const { validateUUID } = await import("../app/api/nfts/mint/route");

    expect(validateUUID("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
    expect(validateUUID("not-a-uuid")).toBe(false);
    expect(validateUUID(123)).toBe(false);
    expect(validateUUID("")).toBe(false);
  });

  test("validateStellarAddress accepts valid addresses and rejects invalid", async () => {
    const { validateStellarAddress } = await import(
      "../app/api/nfts/mint/route"
    );

    const good = "G" + "A".repeat(55);
    expect(validateStellarAddress(good)).toBe(true);
    expect(validateStellarAddress("X" + "A".repeat(55))).toBe(false);
    expect(validateStellarAddress("G" + "A".repeat(10))).toBe(false);
    expect(validateStellarAddress(null)).toBe(false);
  });
});
