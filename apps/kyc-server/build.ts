import { buildClient } from './src/utils/build-client'

/**
 * Main build script
 * This can be run directly with: bun run build.ts
 */
async function main() {
	await buildClient()
}

// Run the build
await main()
