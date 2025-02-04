import { Logger } from "../logger"

const logger = new Logger()
// List of allowed domains for redirection
export const ALLOWED_DOMAINS = [
    'kindfi.org',
    'kindfi.vercel.app',
    'kind-fi.com',
    /^kindfi-[\w-]+\.vercel\.app$/, // Dynamic subdomains
  ]
  
  // Function to validate redirect URLs
  export function isValidRedirectUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      // Check if the hostname matches any allowed domain
      return ALLOWED_DOMAINS.some((domain) =>
        typeof domain === 'string'
          ? parsedUrl.hostname === domain
          : domain.test(parsedUrl.hostname),
      )
    } catch (error) {
      logger.error({
        eventType: 'URL_VALIDATION_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
        url,
        timestamp: new Date().toISOString(),
      })
      return false
    }
  }