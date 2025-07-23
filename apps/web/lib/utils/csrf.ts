// If you see type errors for 'process' or 'crypto', ensure you have @types/node installed
// npm i --save-dev @types/node
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
// Import process for type support in some environments
import process from "node:process";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_TOKEN_LENGTH = 32;

// Generate a cryptographically secure CSRF token
export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

// Set CSRF token in a secure, HTTP-only cookie if not already set
export function ensureCsrfTokenCookie(): string {
  const cookieStore = cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure:
        typeof process !== "undefined" && process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
  }
  return token;
}

// Get CSRF token from cookie
export function getCsrfTokenFromCookie(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

// Validate CSRF token from form against cookie
export function validateCsrfToken(
  formToken: string | null | undefined
): boolean {
  if (!formToken) return false;
  const cookieToken = getCsrfTokenFromCookie();
  return !!cookieToken && formToken === cookieToken;
}
