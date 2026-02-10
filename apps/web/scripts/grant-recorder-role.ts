/**
 * Grant recorder role on gamification contracts via Stellar SDK.
 *
 * Usage:
 *   cd apps/web
 *   npx tsx scripts/grant-recorder-role.ts
 *
 * Requires these env vars (from .env):
 *   - SOROBAN_PRIVATE_KEY (recorder account)
 *   - STELLAR_FUNDING_SECRET_KEY (admin account)
 *   - STREAK_CONTRACT_ADDRESS
 *   - REFERRAL_CONTRACT_ADDRESS
 *   - QUEST_CONTRACT_ADDRESS
 *   - RPC_URL or STELLAR_RPC_URL
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env from apps/web
config({ path: resolve(__dirname, '../.env') })

import { Keypair } from '@stellar/stellar-sdk'
import { GamificationContractService } from '../lib/stellar/gamification-contracts'

async function main() {
	console.log('=== Grant Recorder Role via Stellar SDK ===\n')

	const adminSecret = process.env.STELLAR_FUNDING_SECRET_KEY
	const recorderSecret = process.env.SOROBAN_PRIVATE_KEY

	if (!adminSecret) {
		console.error('Missing STELLAR_FUNDING_SECRET_KEY (admin account)')
		process.exit(1)
	}
	if (!recorderSecret) {
		console.error('Missing SOROBAN_PRIVATE_KEY (recorder account)')
		process.exit(1)
	}

	const adminKeypair = Keypair.fromSecret(adminSecret)
	const recorderAddress = Keypair.fromSecret(recorderSecret).publicKey()

	console.log('Admin address:   ', adminKeypair.publicKey())
	console.log('Recorder address:', recorderAddress)
	console.log()

	const contracts = [
		{ name: 'Streak', address: process.env.STREAK_CONTRACT_ADDRESS },
		{ name: 'Referral', address: process.env.REFERRAL_CONTRACT_ADDRESS },
		{ name: 'Quest', address: process.env.QUEST_CONTRACT_ADDRESS },
	]

	const service = new GamificationContractService()

	for (const contract of contracts) {
		if (!contract.address) {
			console.log(`⚠️  Skipping ${contract.name}: no contract address configured`)
			continue
		}

		console.log(`\n--- ${contract.name} Contract (${contract.address}) ---`)

		// Check current status
		console.log('Checking current has_role...')
		const before = await service.hasRole(contract.address, recorderAddress, 'recorder')
		console.log(`  has_role before: ${before.hasRole}${before.error ? ` (error: ${before.error})` : ''}`)

		if (before.hasRole) {
			console.log(`✅ Recorder role already granted on ${contract.name}`)
			continue
		}

		// Grant the role
		console.log('Granting recorder role...')
		const result = await service.grantRole(
			contract.address,
			recorderAddress,
			'recorder',
			adminKeypair,
		)

		if (result.success) {
			console.log(`✅ grant_role transaction succeeded on ${contract.name}`)
		} else {
			console.error(`❌ grant_role failed on ${contract.name}: ${result.error}`)

			// If grant_role fails, try granting admin role first then retry
			console.log('Trying to grant admin role to admin first...')
			const adminGrant = await service.grantRole(
				contract.address,
				adminKeypair.publicKey(),
				'admin',
				adminKeypair,
			)
			console.log(`  Admin self-grant: ${adminGrant.success ? 'success' : adminGrant.error}`)

			if (adminGrant.success) {
				console.log('Retrying recorder role grant...')
				const retry = await service.grantRole(
					contract.address,
					recorderAddress,
					'recorder',
					adminKeypair,
				)
				if (retry.success) {
					console.log(`✅ grant_role succeeded on retry for ${contract.name}`)
				} else {
					console.error(`❌ grant_role failed on retry for ${contract.name}: ${retry.error}`)
				}
			}
		}

		// Verify after grant
		console.log('Verifying has_role after grant...')
		const after = await service.hasRole(contract.address, recorderAddress, 'recorder')
		console.log(`  has_role after: ${after.hasRole}${after.error ? ` (error: ${after.error})` : ''}`)

		if (after.hasRole) {
			console.log(`✅ VERIFIED: Recorder role is granted on ${contract.name}`)
		} else {
			console.error(`❌ VERIFICATION FAILED: Recorder role NOT granted on ${contract.name}`)
		}
	}

	console.log('\n=== Done ===')
}

main().catch((err) => {
	console.error('Fatal error:', err)
	process.exit(1)
})
