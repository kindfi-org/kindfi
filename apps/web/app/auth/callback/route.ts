import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';

// Utility function for allowlist validation
function isValidRedirectUrl(url: string): boolean {
  const trustedDomains = [
    'kindfi.org',
    'kind-fi.com',
    'kindfi.vercel.app',
  ];
  const subdomainPattern = /^kindfi-.*\.vercel\.app$/;

  try {
    const { hostname, protocol } = new URL(url);

    // Ensure the URL uses HTTPS for secure redirection
    if (protocol !== 'https:') {
      console.warn('Redirect URL must use HTTPS:', url);
      return false;
    }

    // Check if hostname matches trusted domains or subdomain pattern
    if (trustedDomains.includes(hostname) || subdomainPattern.test(hostname)) {
      return true;
    }

    console.warn('Untrusted domain in redirect URL:', hostname);
    return false;

  } catch (error) {
    console.error('Invalid URL:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectUrl = requestUrl.searchParams.get('redirect_url'); // Get redirect URL parameter

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Validate the redirect URL
  if (redirectUrl && isValidRedirectUrl(redirectUrl)) {
    return NextResponse.redirect(redirectUrl);
  }

  // Default to the homepage if no valid redirect URL is provided
  console.warn('Invalid or missing redirect URL, redirecting to homepage');
  return NextResponse.redirect(requestUrl.origin);
}
