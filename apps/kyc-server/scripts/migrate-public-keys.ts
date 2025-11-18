/**
 * Migration Script: Convert COSE Public Keys to Uncompressed Format
 *
 * This script fixes existing device records in the database by converting
 * COSE-encoded public keys to uncompressed secp256r1 format.
 *
 * Run this script ONCE to migrate existing data:
 * ```bash
 * bun run migrate-pk-accounts // from ./package.json scripts
 * ```
 */

import { devices } from '@packages/drizzle'
import {
	convertCoseToUncompressedPublicKey,
	detectPublicKeyFormat,
	uncompressedKeyToBase64,
} from '@packages/lib'
import { eq } from 'drizzle-orm'
import { getDb } from '../src/lib/services/db'

async function migratePublicKeys() {
	console.log('🔄 Starting public key migration...\n')

	const db = getDb

	// Get all devices
	const allDevices = await db.select().from(devices)

	console.log(`📋 Found ${allDevices.length} device records\n`)

	let migratedCount = 0
	let skippedCount = 0
	let errorCount = 0

	for (const device of allDevices) {
		try {
			console.log(`\n📱 Processing device: ${device.credentialId}`)
			console.log(`   Address: ${device.address}`)
			console.log(
				`   Current public key length: ${device.publicKey.length} chars`,
			)

			// Detect current format
			const format = detectPublicKeyFormat(device.publicKey)
			console.log(`   Detected format: ${format}`)

			if (format === 'uncompressed') {
				// publicKey was already converted - move to deviceId
				console.log('   📝 Moving uncompressed key from publicKey to deviceId')
				await db
					.update(devices)
					.set({
						deviceId: device.publicKey, // Move uncompressed to deviceId
						updatedAt: new Date().toISOString(),
					})
					.where(eq(devices.id, device.id))
				console.log('   ⚠️  WARNING: publicKey still has uncompressed format, needs COSE backup')
				migratedCount++
				continue
			}

			if (format === 'cose') {
				// Keep COSE in publicKey, add uncompressed to deviceId
				const coseBuffer = Buffer.from(device.publicKey, 'base64')
				const uncompressedKey = convertCoseToUncompressedPublicKey(coseBuffer)
				const uncompressedBase64 = uncompressedKeyToBase64(uncompressedKey)

				console.log('   📝 Updating database record...')
				console.log('   Format: COSE (keeping in publicKey)')
				console.log('   Adding: Uncompressed to deviceId')
				console.log(`   Uncompressed hex: ${uncompressedKey.toString('hex')}`)

				// Update database - keep COSE, add uncompressed to deviceId
				await db
					.update(devices)
					.set({
						deviceId: uncompressedBase64,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(devices.id, device.id))

				console.log('   ✅ Migrated successfully')
				migratedCount++
			} else {
				console.log('   ⚠️  Unknown format - skipping')
				skippedCount++
			}
		} catch (error) {
			console.error(
				`   ❌ Error processing device ${device.credentialId}:`,
				error,
			)
			errorCount++
		}
	}

	console.log('\n' + '='.repeat(60))
	console.log('📊 Migration Summary')
	console.log('='.repeat(60))
	console.log(`Total devices: ${allDevices.length}`)
	console.log(`Migrated: ${migratedCount}`)
	console.log(`Skipped (already correct): ${skippedCount}`)
	console.log(`Errors: ${errorCount}`)
	console.log('='.repeat(60))

	if (errorCount === 0) {
		console.log('\n✅ Migration completed successfully!')
	} else {
		console.log('\n⚠️  Migration completed with errors. Review the logs above.')
	}
}

// Run migration
migratePublicKeys()
	.then(() => {
		console.log('\n✨ Done!')
		process.exit(0)
	})
	.catch((error) => {
		console.error('\n❌ Migration failed:', error)
		process.exit(1)
	})
