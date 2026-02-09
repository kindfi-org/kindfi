/**
 * Default escrow configuration constants
 */

/**
 * Default USDC address for Stellar testnet
 *
 * Based on Trustless Work documentation, they use Soroban-wrapped USDC contract address:
 * GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
 *
 * For mainnet, this should be updated to the mainnet USDC contract address
 */
export const DEFAULT_USDC_CONTRACT_ADDRESS =
	process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS ||
	process.env.USDC_CONTRACT_ADDRESS ||
	// Soroban-wrapped USDC contract address (from Trustless Work docs)
	'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'

/**
 * Traditional Stellar asset issuer format (G-address)
 * May be needed if Trustless Work API requires issuer format instead of contract address
 *
 * Testnet USDC Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
 */
export const DEFAULT_USDC_ISSUER_ADDRESS =
	process.env.NEXT_PUBLIC_USDC_ISSUER_ADDRESS ||
	process.env.USDC_ISSUER_ADDRESS ||
	// Testnet USDC issuer address (G-address)
	'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
