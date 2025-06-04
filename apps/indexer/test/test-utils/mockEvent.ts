import type { SorobanEvent, StellarBlock } from '@subql/types-stellar'
import { xdr } from 'soroban-client'

export const mockEvent = {
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
