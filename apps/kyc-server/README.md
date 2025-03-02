# Kindfi KYC Server

A server-side rendered React application built with Bun.

## Features

- **Server-Side Rendering (SSR)**: Initial HTML is rendered on the server for fast page loads and SEO benefits
- **Client-Side Routing**: Smooth navigation between pages without full page reloads
- **React 19**: Leverages the latest React features for optimal performance
- **Bun**: Fast JavaScript runtime and bundler
- **Configurable CORS**: Cross-Origin Resource Sharing with support for specific domains or wildcards

## Architecture

### Server-Side Rendering

The application uses React's `renderToReadableStream` to render components on the server. This provides:

- Faster initial page loads
- Better SEO as search engines can crawl the fully rendered HTML
- Progressive enhancement (the site works even without JavaScript)

### Client-Side Routing

After the initial server render, the application hydrates on the client using React Router:

1. The server renders the initial HTML with regular `<a>` links
2. The client-side JavaScript loads and hydrates the page
3. React Router takes over navigation, providing a smooth SPA-like experience
4. When a link is clicked, React Router handles the navigation without a full page reload

### File Structure

- `src/index.tsx` - Main server entry point
- `src/client.tsx` - Client-side entry point for hydration
- `src/components/` - React components
  - `Home.tsx` - Server-side rendered component
  - `App.tsx` - Client-side router layout component
- `src/routes/` - Server route handlers
  - `react.tsx` - React SSR route handlers
  - `passkey.ts` - Passkey authentication routes
  - `ping.ts` - Health check routes
- `build.ts` - Build script for client-side JavaScript
- `public/` - Static assets and compiled client JavaScript
- `docs/` - Documentation
  - `ROUTING.md` - Routing implementation details
  - `BUILD.md` - Build process documentation
  - `PASSKEY.md` - Passkey authentication documentation
  - `CORS.md` - CORS configuration documentation

## How Routing Works

### Server-Side Routes

The server handles these routes:

- `/` - Home page
- `/react` - React demo page
- `/client.js` - Serves the client-side JavaScript bundle
- `/api/passkey/*` - Passkey authentication endpoints
- `/api/ping` - Health check endpoint

Each React route renders the `Home` component with different content.

For detailed information about the routing implementation, see [Routing Documentation](docs/ROUTING.md).

### Client-Side Routes

After hydration, React Router handles navigation between:

- `/` - Home page
- `/react` - React demo page

The `App` component provides the navigation UI, and the router renders different content based on the current URL.

## Development

### Prerequisites

- Bun 1.2.4 or higher

### Setup

```bash
# Install dependencies
bun install

# Copy the example environment file and modify as needed
cp .env.example .env
```

### Development Workflow

```bash
# Build client-side JavaScript
bun run build.ts

# Start the server
bun run src/index.tsx
```

The server will start at http://localhost:3001.

## Production

For production, build the client with minification:

```bash
NODE_ENV=production bun run build.ts
PORT=8080 bun run src/index.tsx
```

## Configuration

### Environment Variables

The application uses environment variables for configuration. A `.env.example` file is provided as a template.

Key environment variables include:

```
# Server configuration
PORT=3001
NODE_ENV=development

# WebAuthn configuration
RP_ID='["localhost", "your-domain.com"]'
RP_NAME='["App", "Your App Name"]'
EXPECTED_ORIGIN='["http://localhost:3001", "https://your-domain.com"]'
CHALLENGE_TTL_SECONDS=60

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,http://localhost:3001
```

### CORS Configuration

The API supports configurable CORS settings. For detailed CORS configuration options, see [CORS Documentation](docs/CORS.md).

## Documentation

- [Routing Implementation](docs/ROUTING.md) - Details about the routing implementation
- [Build Process](docs/BUILD.md) - Information about the build process
- [Passkey Authentication](docs/PASSKEY.md) - Documentation for the passkey authentication
- [CORS Configuration](docs/CORS.md) - CORS configuration details
- [Client Example](docs/client-example.js) - Example client implementation
