import { existsSync, mkdirSync } from 'node:fs'
import { readdir, rename, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { appEnvConfig } from '@packages/lib'
import { build } from 'bun'
import tailwindPlugin from 'bun-plugin-tailwind'

const appConfig = appEnvConfig()

/**
 * Builds the client-side JavaScript with a dynamic filename
 * @returns A promise that resolves when the build is complete
 */
export async function buildClient() {
	console.log('🔨 Building client-side JavaScript...')

	// Ensure public directory exists
	const publicDir = join(process.cwd(), 'public')
	if (!existsSync(publicDir)) {
		mkdirSync(publicDir, { recursive: true })
	}

	// Generate a unique hash based on current timestamp
	const hash =
		Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
	const clientFileName = `client-${hash}.js`

	// Build the client JavaScript
	const result = await build({
		entrypoints: ['./src/client.tsx'],
		outdir: './public',
		plugins: [tailwindPlugin],
		minify: appConfig.env.nodeEnv === 'production',
		target: 'browser',
		format: 'esm',
	})

	if (!result.success) {
		console.error('❌ Build failed:', result.logs)
		process.exit(1)
	}

	// Rename the output file to include the hash
	const originalPath = join(publicDir, 'client.js')
	const newPath = join(publicDir, clientFileName)
	await rename(originalPath, newPath)

	// Create a manifest file with the current client filename
	const manifestPath = join(publicDir, 'manifest.json')
	const manifest = {
		clientJs: clientFileName,
		buildTime: new Date().toISOString(),
	}

	await writeFile(manifestPath, JSON.stringify(manifest, null, 2))

	// Clean up old client JavaScript files
	await cleanupOldClientFiles(publicDir, clientFileName)

	console.log(`✅ Client build successful! Generated: ${clientFileName}`)

	return {
		...result,
		clientFileName,
	}
}

/**
 * Cleans up old client JavaScript files, keeping only the most recent one
 * @param publicDir The public directory path
 * @param currentFileName The current client filename to keep
 */
async function cleanupOldClientFiles(
	publicDir: string,
	currentFileName: string,
) {
	try {
		// Read all files in the public directory
		const files = await readdir(publicDir)

		// Filter for client JavaScript files that are not the current one
		const oldClientFiles = files.filter(
			(file) =>
				file.startsWith('client-') &&
				file.endsWith('.js') &&
				file !== currentFileName,
		)

		if (oldClientFiles.length === 0) {
			return
		}

		console.log(`🧹 Cleaning up ${oldClientFiles.length} old client file(s)...`)

		// Delete each old client file
		for (const file of oldClientFiles) {
			const filePath = join(publicDir, file)
			await unlink(filePath)
			console.log(`  Deleted: ${file}`)
		}
	} catch (error) {
		console.error('Error cleaning up old client files:', error)
	}
}
