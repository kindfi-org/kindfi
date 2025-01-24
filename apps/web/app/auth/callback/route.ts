import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '~/lib/supabase/server';
import winston from 'winston';

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

// Utility function for allowlist validation
function isValidRedirectUrl(url: string): boolean {
  const trustedDomains = [
    'kindfi.org',
	'www.kindfi.org',
    'kind-fi.com',
	'www.kind-fi.com',
    'kindfi.vercel.app',
	'localhost',
  ];
  // Tighter subdomain pattern: allows only alphanumeric characters after 'kindfi-'
  const subdomainPattern = /^kindfi-[a-zA-Z0-9]+\.vercel\.app$/;

  try {
    // Ensure the URL is a valid string and sanitize
    if (typeof url !== 'string') {
      logger.warn('Invalid redirect_url type:', { url });
      return false;
    }

    const sanitizedUrl = new URL(url); // This will throw an error if the URL is malformed
    const { hostname, protocol } = sanitizedUrl;

    // Ensure the URL uses HTTPS for secure redirection
    if (protocol !== 'https:') {
      logger.warn('Redirect URL must use HTTPS:', { url });
      return false;
    }

    // Check if hostname matches trusted domains or subdomain pattern
    if (trustedDomains.includes(hostname) || subdomainPattern.test(hostname)) {
      return true;
    }

    logger.warn('Untrusted domain in redirect URL:', { hostname });
    return false;

  } catch (error) {
    logger.error('Invalid or malformed URL:', { error });
    return false;
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectUrl = requestUrl.searchParams.get('redirect_url'); // Get redirect URL parameter

  // Validate if redirectUrl is a valid string before passing it for validation
  if (redirectUrl && typeof redirectUrl === 'string' && isValidRedirectUrl(redirectUrl)) {
    return NextResponse.redirect(redirectUrl);
  }

  // Default to the homepage if no valid redirect URL is provided
  logger.warn('Invalid or missing redirect URL, redirecting to homepage');
  return NextResponse.redirect(requestUrl.origin);
}
