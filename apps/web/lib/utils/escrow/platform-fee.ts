/** Trustless Work max platform fee (human-readable percent). */
export const MAX_PLATFORM_FEE_PERCENT = 99

/** KindFi platform fee on all escrows (human-readable percent). */
export const KINDFI_PLATFORM_FEE_PERCENT = 1

/** Trustless Work wire value for {@link KINDFI_PLATFORM_FEE_PERCENT}. */
export const KINDFI_TRUSTLESS_WORK_PLATFORM_FEE = KINDFI_PLATFORM_FEE_PERCENT * 100

/**
 * Indexer responses use centi-percent (e.g. 100 = 1%, 60 = 0.6%).
 * KindFi stores human percent (1 = 1%).
 */
export const toTrustlessWorkPlatformFee = (humanPercent: number): number => humanPercent * 100

export const fromTrustlessWorkPlatformFee = (twFee: number): number => twFee / 100

/** Centi-percent for indexer payloads (100 = 1%). */
export const getKindfiTrustlessWorkPlatformFee = (): number =>
	toTrustlessWorkPlatformFee(KINDFI_PLATFORM_FEE_PERCENT)

/** Human percent for Trustless Work deploy/update API bodies (1 = 1%). */
export const getKindfiDeployPlatformFee = (): number => KINDFI_PLATFORM_FEE_PERCENT

export const formatHumanPlatformFee = (humanPercent: number): string => {
	const normalized = Number(humanPercent.toFixed(4))
	const text = Number.isInteger(normalized)
		? String(normalized)
		: String(normalized)
				.replace(/(\.\d*?)0+$/, '$1')
				.replace(/\.$/, '')

	return `${text}%`
}
