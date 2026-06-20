import { ETHERFUSE_FIAT_CURRENCIES } from '~/lib/etherfuse/constants'

const RAMP_CURRENCY_LABELS: Record<(typeof ETHERFUSE_FIAT_CURRENCIES)[number], string> = {
	MXN: 'profile.rampsCurrencyMxn',
	BRL: 'profile.rampsCurrencyBrl',
}

export const RAMP_CURRENCIES = ETHERFUSE_FIAT_CURRENCIES.map((value) => ({
	value,
	labelKey: RAMP_CURRENCY_LABELS[value],
}))

const ASSET_ACCENTS: Record<string, string> = {
	USDC: 'bg-sky-50 text-sky-700 ring-sky-200',
	CETES: 'bg-amber-50 text-amber-700 ring-amber-200',
	USDx: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
	EURC: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
}

export const getRampAssetAccent = (symbol: string) =>
	ASSET_ACCENTS[symbol] ?? 'bg-slate-50 text-slate-700 ring-slate-200'

export const truncateWalletAddress = (address: string) =>
	`${address.slice(0, 8)}…${address.slice(-8)}`
