import type { HttpMethod } from '../utils.types'
import type {
	ChangeMilestoneFlagPayload,
	ChangeMilestoneStatusPayload,
	DistributeEscrowEarningsEscrowPayload,
	EditMilestonesPayload,
	EscrowPayload,
	FundEscrowPayload,
	GetBalanceParams,
	ResolveDisputePayload,
	StartDisputePayload,
} from './escrow-payload.types'

export type EscrowEndpoint =
	| 'initiate'
	| 'fund'
	| 'dispute'
	| 'resolve'
	| 'release'
	| 'completeMilestone'
	| 'approveMilestone'
	| 'edit'
	| 'startDispute'
	| 'resolveDispute'

export type TCreateEscrowRequest<T extends EscrowEndpoint> = {
	action: T
	method: HttpMethod
	data?:
		| EscrowPayload
		| StartDisputePayload
		| EditMilestonesPayload
		| ChangeMilestoneStatusPayload
		| ResolveDisputePayload
		| ChangeMilestoneFlagPayload
		| FundEscrowPayload
		| DistributeEscrowEarningsEscrowPayload

	params?: GetBalanceParams
}
