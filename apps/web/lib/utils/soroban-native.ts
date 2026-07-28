/** Unwrap Soroban Option values decoded by scValToNative (`{ tag: 'Some', values: [T] }`). */
export const unwrapScValOption = <T>(value: unknown): T | null => {
	if (value === null || value === undefined) {
		return null
	}

	if (typeof value === 'object') {
		const tagged = value as { tag?: string; values?: unknown[] }
		if (tagged.tag === 'None') {
			return null
		}
		if (tagged.tag === 'Some' && tagged.values?.[0] !== undefined) {
			return tagged.values[0] as T
		}
	}

	return value as T
}

export type NormalizedNftAttribute = {
	trait_type: string
	value: string
	display_type?: string
	max_value?: string
}

export type NormalizedNftMetadata = {
	name: string
	description: string
	image_uri: string
	external_url: string
	attributes: NormalizedNftAttribute[]
}

const asString = (value: unknown): string => {
	if (value === null || value === undefined) {
		return ''
	}
	return String(value).trim()
}

/** Normalize Address values returned by scValToNative. */
export const normalizeStellarAddress = (value: unknown): string | null => {
	if (!value) {
		return null
	}

	if (typeof value === 'string') {
		return value
	}

	if (typeof value === 'object') {
		const record = value as Record<string, unknown>
		for (const key of ['address', 'value', 'accountId', 'contractId']) {
			const candidate = record[key]
			if (typeof candidate === 'string' && candidate.length > 0) {
				return candidate
			}
		}
	}

	const fallback = String(value)
	return fallback && fallback !== '[object Object]' ? fallback : null
}

const normalizeAttribute = (raw: unknown): NormalizedNftAttribute | null => {
	if (!raw || typeof raw !== 'object') {
		return null
	}

	const record = raw as Record<string, unknown>
	const traitType = asString(record.trait_type ?? record.traitType)
	const value = asString(record.value)

	if (!traitType) {
		return null
	}

	const displayType = asString(record.display_type ?? record.displayType)
	const maxValue = asString(record.max_value ?? record.maxValue)

	return {
		trait_type: traitType,
		value,
		...(displayType ? { display_type: displayType } : {}),
		...(maxValue ? { max_value: maxValue } : {}),
	}
}

/** Normalize NFT metadata from scValToNative (handles Option wrapper and field aliases). */
export const normalizeNftMetadata = (
	raw: unknown,
	fallbackTokenId: number,
): NormalizedNftMetadata => {
	const unwrapped = unwrapScValOption<Record<string, unknown>>(raw) ?? {}
	const record =
		unwrapped && typeof unwrapped === 'object'
			? unwrapped
			: typeof raw === 'object' && raw !== null
				? (raw as Record<string, unknown>)
				: {}

	const attributesRaw = record.attributes
	const attributes: NormalizedNftAttribute[] = Array.isArray(attributesRaw)
		? attributesRaw
				.map(normalizeAttribute)
				.filter((attr): attr is NormalizedNftAttribute => attr !== null)
		: []

	const imageUri = asString(record.image_uri ?? record.imageUri ?? record.image)

	return {
		name: asString(record.name) || `Kinder NFT #${fallbackTokenId}`,
		description: asString(record.description),
		image_uri: imageUri,
		external_url: asString(record.external_url ?? record.externalUrl),
		attributes,
	}
}
