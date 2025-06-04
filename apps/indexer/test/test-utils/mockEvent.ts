import type { SorobanEvent, StellarBlock } from '@subql/types-stellar'
import { xdr } from 'soroban-client'

/**
 * Comprehensive mock SorobanEvent for testing blockchain event handling logic.
 *
 * This mock event simulates a realistic event emitted from the Stellar blockchain,
 * including detailed ledger and contract data. It is strongly typed as SorobanEvent
 * and includes fields such as ledger sequence, contractId, topic, and value, all
 * populated with plausible test values. The ledger property is typed as StellarBlock
 * to ensure type safety and accurate structure.
 *
 * Usage:
 * - Use this mock in unit and integration tests to validate event processing logic.
 * - Ensures that event handlers and indexers can correctly parse and handle real-world
 *   blockchain event data structures.
 * - Facilitates regression testing by providing a stable, comprehensive event fixture.
 *
 * TypeScript Types:
 * - SorobanEvent (from @subql/types-stellar)
 * - StellarBlock (for the ledger property)
 *
 * This mock is intended to improve test reliability and maintainability by providing
 * a single source of realistic event data for all test scenarios.
 */
export const mockEvent = {
	id: 'test-event-1',
	ledger: {
		sequence: 1000003, // Chosen to simulate a high, realistic ledger sequence for regression testing
		id: 'test-ledger-1',
		paging_token: 'token-1',
		hash: 'hash-1',
		prev_hash: 'prev-hash-1',
		successful_transaction_count: 1,
		failed_transaction_count: 0,
		operation_count: 1,
		tx_set_operation_count: 1,
		closed_at: '2025-06-02T22:29:29.585Z',
		total_coins: '100000000',
		fee_pool: '1000',
		base_fee_in_stroops: 100, // Typical base fee for testnet/mainnet
		base_reserve_in_stroops: 5000000, // Standard base reserve for realistic block
		max_tx_set_size: 1000, // Reflects a common max transaction set size
		protocol_version: 20, // Matches a recent Stellar protocol version for compatibility
		header_xdr: 'header-xdr-1',
	} as StellarBlock,
	ledgerClosedAt: '2025-06-02T22:29:29.585Z',
	contractId: {
		contractId: () => 'test-contract-1',
	},
	topic: [
		xdr.ScVal.scvString('env'),
		xdr.ScVal.scvString(
			'GBYK4I37MZKLL4A2QS7VJCTM5DCNQI2XZWCPM6H4ZHIBMXH3JSTSHZJS',
		),
		xdr.ScVal.scvString(
			'GDNSSYSCSSJ76FER5WEEXME5G4MTCUBKDRQSKOYP2PQ5TBDSV4XEMJSD',
		),
	],
	value: xdr.ScVal.scvU64(xdr.Uint64.fromString('1000000')),
} as SorobanEvent
