import { subqlTest } from '@subql/testing'
import type { SorobanEvent, StellarBlock } from '@subql/types-stellar'
import { xdr } from 'soroban-client'
import { handleEvent } from '../src/mappings/handlers'
import { Account, Transfer } from '../src/types'
import { mockEvent } from './test-utils/mockEvent'

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

test('handleEvent throws on invalid event data', async () => {
	const invalidEvent = { ...mockEvent, topic: [] } // missing required topic structure
	await expect(handleEvent(invalidEvent)).rejects.toThrow()
})
