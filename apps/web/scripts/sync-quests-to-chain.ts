/**
 * Sync quest_definitions from Supabase to the on-chain Quest contract.
 *
 * Usage:
 *   cd apps/web
 *   bun run scripts/sync-quests-to-chain.ts
 *
 * Mainnet requires ADMIN_PRIVATE_KEY (production deployer, e.g. GB2PW...).
 * STELLAR_FUNDING_SECRET_KEY in .env is often testnet-only (GAC63...).
 *
 * Bun loads apps/web/.env automatically when run from that directory.
 */

import { supabase } from '@packages/lib/supabase'
import * as SorobanRpc from '@stellar/stellar-sdk/rpc'
import {
	ensureAllQuestDefinitionsOnChain,
	getAdminKeypair,
	getHighestQuestIdOnChain,
	isMainnetNetwork,
	resolveQuestContractAddress,
} from '../lib/services/quest-chain-sync.service'
import { GamificationContractService } from '../lib/stellar/gamification-contracts'

async function verifyAccountOnNetwork(
	server: SorobanRpc.Server,
	address: string,
	label: string,
): Promise<boolean> {
	try {
		await server.getAccount(address)
		return true
	} catch {
		console.error(`❌ ${label} ${address} is not funded on this network.`)
		return false
	}
}

async function ensureAdminRole(
	service: GamificationContractService,
	contractAddress: string,
): Promise<boolean> {
	const adminKeypair = getAdminKeypair()
	if (!adminKeypair) {
		console.error(
			'Missing admin key: set ADMIN_PRIVATE_KEY (mainnet) or STELLAR_FUNDING_SECRET_KEY (testnet)',
		)
		return false
	}

	const adminAddress = adminKeypair.publicKey()
	console.log(`Admin address: ${adminAddress}`)

	if (isMainnetNetwork() && adminAddress.startsWith('GAC63')) {
		console.error(
			'❌ This looks like the testnet admin (GAC63...). Set ADMIN_PRIVATE_KEY to your mainnet production secret (GB2PW...).',
		)
		return false
	}

	const before = await service.hasRole(contractAddress, adminAddress, 'admin')
	if (before.hasRole) {
		console.log('✅ Admin role already granted on Quest contract')
		return true
	}

	console.log('Granting admin role on Quest contract...')
	const grantResult = await service.grantRole(contractAddress, adminAddress, 'admin', adminKeypair)

	if (!grantResult.success) {
		console.error(`❌ grant_role(admin) failed: ${grantResult.error}`)
		if (grantResult.txHash) {
			console.error(`   tx: ${grantResult.txHash}`)
		}
		return false
	}

	const after = await service.hasRole(contractAddress, adminAddress, 'admin')
	if (!after.hasRole) {
		console.error('❌ Admin role grant tx submitted but has_role still false')
		return false
	}

	console.log('✅ Admin role granted and verified')
	return true
}

async function main() {
	console.log('=== Sync Quest Definitions to On-Chain ===\n')

	const networkPassphrase =
		process.env.STELLAR_NETWORK_PASSPHRASE || process.env.NETWORK_PASSPHRASE || 'unknown'
	console.log(`Network: ${networkPassphrase}\n`)

	const contractAddress = resolveQuestContractAddress()
	if (!contractAddress) {
		console.error('Missing QUEST_CONTRACT_ADDRESS in environment')
		process.exit(1)
	}

	const adminKeypair = getAdminKeypair()
	if (!adminKeypair) {
		console.error('Missing ADMIN_PRIVATE_KEY (mainnet) or STELLAR_FUNDING_SECRET_KEY (testnet)')
		process.exit(1)
	}

	console.log(`Quest contract: ${contractAddress}\n`)

	const { data: quests, error } = await supabase
		.from('quest_definitions')
		.select('*')
		.order('quest_id', { ascending: true })

	if (error) {
		console.error('Failed to fetch quest_definitions:', error.message)
		process.exit(1)
	}

	if (!quests?.length) {
		console.log('No quests in database — nothing to sync.')
		process.exit(0)
	}

	console.log(
		`Found ${quests.length} quest(s) in database (IDs ${quests[0].quest_id}–${quests[quests.length - 1].quest_id})\n`,
	)

	// Use admin account for RPC reads/writes so mainnet sync works even when SOROBAN_PRIVATE_KEY is testnet-only
	const service = new GamificationContractService(undefined, undefined, adminKeypair.secret())

	const rpc = process.env.STELLAR_RPC_URL || process.env.RPC_URL || 'https://mainnet.sorobanrpc.com'
	const server = new SorobanRpc.Server(rpc, { allowHttp: true })

	if (!(await verifyAccountOnNetwork(server, adminKeypair.publicKey(), 'Admin account'))) {
		if (isMainnetNetwork()) {
			console.error(
				'\nSet ADMIN_PRIVATE_KEY in apps/web/.env to your mainnet `production` Stellar CLI secret.',
			)
		}
		process.exit(1)
	}

	const maxOnChainBefore = await getHighestQuestIdOnChain(
		service,
		contractAddress,
		quests[quests.length - 1].quest_id,
	)
	console.log(`On-chain quests before sync: ${maxOnChainBefore}\n`)

	if (!(await ensureAdminRole(service, contractAddress))) {
		process.exit(1)
	}

	console.log('\nSyncing quest definitions...')
	const syncResult = await ensureAllQuestDefinitionsOnChain(
		service,
		contractAddress,
		quests,
		adminKeypair,
	)

	if (!syncResult.success) {
		console.error(`\n❌ Sync failed: ${syncResult.error}`)
		process.exit(1)
	}

	const maxOnChainAfter = await getHighestQuestIdOnChain(
		service,
		contractAddress,
		quests[quests.length - 1].quest_id,
	)
	let created = 0
	let skipped = 0

	for (const quest of quests) {
		const existedBefore = quest.quest_id <= maxOnChainBefore
		if (existedBefore) {
			skipped++
			console.log(`  ⏭️  Quest ${quest.quest_id} "${quest.name}" — already on-chain`)
		} else {
			created++
			console.log(`  ✅ Quest ${quest.quest_id} "${quest.name}" — created on-chain`)
		}
	}

	console.log('\n=== Sync Complete ===')
	console.log(`  Skipped (already existed): ${skipped}`)
	console.log(`  Created:                   ${created}`)
	console.log(`  On-chain max quest ID:     ${maxOnChainAfter}`)
}

main().catch((err) => {
	console.error('Fatal error:', err)
	process.exit(1)
})
