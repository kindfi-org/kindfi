import { updateSession } from "@packages/lib/supabase-server";
import { NextResponse } from "next/server";
import { type NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { ensureCsrfTokenCookie } from "~/app/actions/csrf";

// * Infer the type of the first parameter of updateSession
type ExpectedRequestType = Parameters<typeof updateSession>[0];

// Auth protected path prefixes / exact matches
// const AUTH_PROTECTED_PATHS = ['/create-project', '/dashboard']
const AUTH_PROTECTED_PATHS: string[] = [];

function isProtectedPath(pathname: string) {
  return (
    AUTH_PROTECTED_PATHS.includes(pathname) ||
    // /projects/[slug]/manage pattern
    (pathname.startsWith("/projects/") && pathname.endsWith("/manage"))
  );
}

const AUTH_PAGES = [
  "/sign-in",
  "/sign-up",
  "/reset-password",
  "/reset-account",
];
// const AUTH_PAGES: string[] = []

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    try {
      const { pathname } = req.nextUrl;

      // Skip NextAuth internal API & static auth pages handling (withAuth already ran token decode)
      if (pathname.startsWith("/api/auth") || AUTH_PAGES.includes(pathname)) {
        return NextResponse.next({ request: { headers: req.headers } });
      }

      await ensureCsrfTokenCookie();

      // Redirect unauthenticated access to protected paths only
      if (isProtectedPath(pathname) && !req.nextauth?.token) {
        const url = req.nextUrl.clone();
        url.pathname = "/sign-in";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }

      // Pass through Supabase session refresh logic
      return await updateSession(req as unknown as ExpectedRequestType, null);
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.next({
        request: { headers: req.headers },
      });
    }
  },
  {
    pages: {
      signIn: "/sign-in",
      signOut: "/sign-out",
      error: "/error",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        // Always allow auth utility pages & public paths
        if (AUTH_PAGES.includes(pathname)) return true;
        // Enforce auth only for protected paths
        if (isProtectedPath(pathname)) return !!token;
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    // Exclude NextAuth API routes explicitly at the matcher level too
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
