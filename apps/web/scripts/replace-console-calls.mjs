#!/usr/bin/env node
/**
 * Bulk-replaces bare console.* calls in apps/web source files with
 * imports of the structured logger and logger.* method calls.
 *
 * Rules:
 *  1. If the file already imports from '@/lib/logger' or '../lib/logger'
 *     etc., skip adding another import.
 *  2. Add `import { logger } from '@/lib/logger'` at the top after any
 *     existing imports.
 *  3. Replace:
 *       console.log(...)  → logger.info(...)   [treat as info-level]
 *       console.debug(...) → logger.debug(...)
 *       console.warn(...) → logger.warn(...)
 *       console.error(...) → logger.error(...)
 *  4. Remove commented-out console.* lines.
 *  5. Skip files in scripts/, public/, and *.test.* / *.spec.*
 *
 * This script uses simple string transforms (no AST). It is safe to run
 * multiple times (idempotent — already-replaced calls will not match).
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const ROOT = new URL('../../../', import.meta.url).pathname
const WEB_APP = join(ROOT, 'apps/web')

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
const SKIP_DIRS = new Set([
	'.next',
	'node_modules',
	'dist',
	'build',
	'public', // service-workers are excluded via biome override
	'scripts', // excluded via biome override
])

// Match console.log/debug/warn/error calls that are NOT already inside a comment
// Also match the `console.error` reference used as a callback (e.g. .catch(console.error))
const COMMENTED_CONSOLE_RE = /^(\s*)\/\/.*console\.(log|debug|warn|error|info).*/gm
const CONSOLE_LOG_RE = /\bconsole\.log\s*\(/g
const CONSOLE_DEBUG_RE = /\bconsole\.debug\s*\(/g
const CONSOLE_WARN_RE = /\bconsole\.warn\s*\(/g
const CONSOLE_ERROR_RE = /\bconsole\.error\s*\(/g
// Match usage as callback: .catch(console.error) | .then(null, console.error)
const CATCH_CONSOLE_RE = /\.catch\(console\.error\)/g
const _THEN_CONSOLE_RE = /,\s*console\.error\)/g

const LOGGER_IMPORT_RE = /from\s+['"][^'"]*\/logger['"]/
const LOGGER_IMPORT_LINE = "import { logger } from '@/lib/logger'"

let totalFilesModified = 0
let totalReplacements = 0

function shouldSkipDir(name) {
	return SKIP_DIRS.has(name)
}

function shouldSkipFile(name) {
	return name.includes('.test.') || name.includes('.spec.')
}

function processFile(filePath) {
	const ext = extname(filePath)
	if (!EXTENSIONS.has(ext)) return

	const relPath = relative(ROOT, filePath)
	let content = readFileSync(filePath, 'utf-8')
	const original = content

	// 1. Remove commented-out console.* lines
	content = content.replace(COMMENTED_CONSOLE_RE, '')

	// 2. Replace .catch(console.error) with logger callback
	content = content.replace(
		CATCH_CONSOLE_RE,
		".catch((err) => logger.error('Unhandled error', err instanceof Error ? err : new Error(String(err))))",
	)

	// 3. Replace console.log -> logger.info
	const logCount = (content.match(CONSOLE_LOG_RE) || []).length
	content = content.replace(CONSOLE_LOG_RE, 'logger.info(')

	// 4. Replace console.debug -> logger.debug
	const debugCount = (content.match(CONSOLE_DEBUG_RE) || []).length
	content = content.replace(CONSOLE_DEBUG_RE, 'logger.debug(')

	// 5. Replace console.warn -> logger.warn
	const warnCount = (content.match(CONSOLE_WARN_RE) || []).length
	content = content.replace(CONSOLE_WARN_RE, 'logger.warn(')

	// 6. Replace console.error -> logger.error
	const errorCount = (content.match(CONSOLE_ERROR_RE) || []).length
	content = content.replace(CONSOLE_ERROR_RE, 'logger.error(')

	const replaced = logCount + debugCount + warnCount + errorCount
	if (replaced === 0 && content === original) return

	// 7. Add logger import if not already present and we made replacements
	if (replaced > 0 && !LOGGER_IMPORT_RE.test(content)) {
		// Find the first import line and insert after all imports
		const lines = content.split('\n')
		let lastImportIndex = -1
		for (let i = 0; i < lines.length; i++) {
			if (
				lines[i].trimStart().startsWith('import ') ||
				lines[i].trimStart().startsWith("'use ") ||
				lines[i].trimStart().startsWith('"use ')
			) {
				// Skip 'use client'/'use server' directives
				if (!lines[i].includes('use client') && !lines[i].includes('use server')) {
					lastImportIndex = i
				}
			}
		}
		if (lastImportIndex === -1) {
			// No imports found, prepend
			content = `${LOGGER_IMPORT_LINE}\n\n${content}`
		} else {
			lines.splice(lastImportIndex + 1, 0, LOGGER_IMPORT_LINE)
			content = lines.join('\n')
		}
	}

	if (content !== original) {
		writeFileSync(filePath, content, 'utf-8')
		console.log(`✅ Modified (${replaced} replacements): ${relPath}`)
		totalFilesModified++
		totalReplacements += replaced
	}
}

function walk(dir) {
	for (const entry of readdirSync(dir)) {
		if (shouldSkipDir(entry)) continue
		const full = join(dir, entry)
		const stat = statSync(full)
		if (stat.isDirectory()) {
			walk(full)
		} else if (!shouldSkipFile(entry)) {
			processFile(full)
		}
	}
}

console.log('🔍 Scanning apps/web for console.* calls...\n')
walk(WEB_APP)

console.log(`\n📊 Summary:`)
console.log(`  Files modified : ${totalFilesModified}`)
console.log(`  Total replacements: ${totalReplacements}`)
console.log('\n✅ Done!')
