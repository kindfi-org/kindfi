# Build Process

This document explains the build process for the Kindfi KYC Server application, which uses Bun's built-in bundler to compile the client-side JavaScript.

## Overview

The application uses a two-part build process:

1. **Server-Side Code**: TypeScript files are executed directly by Bun without a separate build step
2. **Client-Side Code**: TypeScript/React files are bundled into JavaScript using Bun's bundler

## Client-Side Build

### Build Configuration

The client-side build is configured in `src/index.tsx` and uses Bun's built-in bundler:

```typescript
async function buildClient() {
  console.log("🔨 Building client-side JavaScript...");

  const result = await build({
    entrypoints: ["./src/client.tsx"],
    outdir: "./public",
    minify: process.env.NODE_ENV === "production",
    target: "browser",
    format: "esm",
  });

  if (!result.success) {
    console.error("❌ Build failed:", result.logs);
    process.exit(1);
  }

  console.log("✅ Client build successful!");
}
```

### Build Options

- **entrypoints**: The entry point for the client-side code (`./src/client.tsx`)
- **outdir**: The output directory for the bundled JavaScript (`./public`)
- **minify**: Whether to minify the JavaScript (enabled in production)
- **target**: The target environment (`browser`)
- **format**: The module format (`esm` for ECMAScript modules)

### Build on Server Start

The build process is automatically run when the server starts:

```typescript
async function startServer() {
  // Build the client-side JavaScript first
  await buildClient();

  // Start the server
  // ...
}
```

This ensures that the client-side JavaScript is always up-to-date with the server-side code.

## Standalone Build

You can also run the build process separately using the `build.ts` script:

```bash
bun run build.ts
```

This is useful for:

- Testing the build process
- Building the client-side code before deploying
- Building with different environment variables

## Production Build

For production, you can enable minification by setting the `NODE_ENV` environment variable:

```bash
NODE_ENV=production bun run build.ts
```

This will:

1. Minify the JavaScript to reduce file size
2. Remove development-only code
3. Optimize the bundle for production

## Development vs. Production

The build process behaves differently in development and production:

### Development

- No minification (for easier debugging)
- Source maps are included
- Development-only code is preserved

### Production

- JavaScript is minified
- Source maps are excluded
- Development-only code is removed

## Serving the Built Files

The server serves the built files from the `public` directory:

```typescript
// Serve static files from the public directory
if (url.pathname.startsWith("/client.js")) {
  try {
    const filePath = join(import.meta.dir, "../public/client.js");
    const file = Bun.file(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving static file:", error);
    return new Response("File not found", { status: 404 });
  }
}
```

## Advanced Build Configuration

For more advanced build needs, you can:

- Add multiple entry points
- Configure code splitting
- Add external dependencies
- Customize the minification process
- Add plugins for additional functionality

See the [Bun Bundler documentation](https://bun.sh/docs/bundler) for more information.
