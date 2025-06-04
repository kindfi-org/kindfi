import { subqlTest } from '@subql/testing'
import type { SorobanEvent, StellarBlock } from '@subql/types-stellar'
import { xdr } from 'soroban-client'
import { handleEvent } from '../mappings/handlers'
import { Account, Transfer } from '../types'

// Mock data for testing
const mockEvent = {
	id: 'test-event-1',
	ledger: {
		sequence: 1000003,
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
		base_fee_in_stroops: 100,
		base_reserve_in_stroops: 5000000,
		max_tx_set_size: 1000,
		protocol_version: 20,
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

test('handleEvent processes transfer correctly', async () => {
	await subqlTest(
		'Test Transfer Event Processing',
		1000003,
		[], // No dependent entities needed
		[
			{
				type: Account,
				id: 'GBYK4I37MZKLL4A2QS7VJCTM5DCNQI2XZWCPM6H4ZHIBMXH3JSTSHZJS'.toLowerCase(),
				expectedValue: {
					firstSeenLedger: 1000003,
					lastSeenLedger: 1000003,
				},
			},
			{
				type: Account,
				id: 'GDNSSYSCSSJ76FER5WEEXME5G4MTCUBKDRQSKOYP2PQ5TBDSV4XEMJSD'.toLowerCase(),
				expectedValue: {
					firstSeenLedger: 1000003,
					lastSeenLedger: 1000003,
				},
			},
			{
				type: Transfer,
				id: mockEvent.id,
				expectedValue: {
					ledger: 1000003,
					date: new Date(mockEvent.ledgerClosedAt),
					contract: mockEvent.contractId?.contractId() ?? '',
					value: BigInt(1000000),
					fromId:
						'GBYK4I37MZKLL4A2QS7VJCTM5DCNQI2XZWCPM6H4ZHIBMXH3JSTSHZJS'.toLowerCase(),
					toId: 'GDNSSYSCSSJ76FER5WEEXME5G4MTCUBKDRQSKOYP2PQ5TBDSV4XEMJSD'.toLowerCase(),
				},
			},
		],
		'handleEvent',
	)
})
