import 'server-only'

export type PulseQuoteAsset = 'XLM' | 'USDC'

export type PulseQuoteNetwork = 'mainnet' | 'testnet'

export interface PulseQuoteSuccess {
	price: number
	decimals: number
	timestamp: number
	source: 'reflector-pulse'
	feedContractId: string
}

export interface PulseQuoteUnavailable {
	status: 'missing' | 'stale'
}

export type PulseQuoteResult = PulseQuoteSuccess | PulseQuoteUnavailable

export interface ReadPulseQuoteParams {
	network: PulseQuoteNetwork
	asset: PulseQuoteAsset
}

export type ReadPulseQuoteFn = (params: ReadPulseQuoteParams) => Promise<PulseQuoteResult>

/**
 * Server-only Reflector Pulse quote reader seam.
 *
 * The live `@reflector/contract-client` RPC simulation lives in issue #1136.
 * Until #1136 merges onto `develop`, this function fails closed with
 * `{ status: 'missing' }` and never returns a fabricated `0` price.
 */
export async function readPulseQuote(_params: ReadPulseQuoteParams): Promise<PulseQuoteResult> {
	return { status: 'missing' }
}
