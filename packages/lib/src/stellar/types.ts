/**
 * Shared types for Stellar Smart Account operations
 */

/**
 * WebAuthn signature data structure matching OpenZeppelin Smart Account format
 */
export interface WebAuthnSignatureData {
	signature: Uint8Array // 64 bytes for secp256r1
	authenticatorData: Uint8Array // Minimum 37 bytes
	clientData: Uint8Array // Max 1024 bytes, JSON string
}
