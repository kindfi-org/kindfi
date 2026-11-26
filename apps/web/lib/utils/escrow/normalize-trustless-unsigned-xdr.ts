export type UnsignedEscrowPayload = {
	unsignedTransaction?: string
	unsignedXdr?: string
}

/** Trustless Work v2 returns `unsignedXdr`; v1 SDK uses `unsignedTransaction`. */
export const normalizeTrustlessUnsignedXdr = (
	payload: UnsignedEscrowPayload,
): string | undefined => {
	const xdr = payload.unsignedXdr ?? payload.unsignedTransaction
	return typeof xdr === 'string' && xdr.trim().length > 0 ? xdr : undefined
}
