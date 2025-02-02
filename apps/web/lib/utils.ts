import { type ClassValue, clsx } from 'clsx'
import { redirect } from 'next/navigation'
import Server from 'stellar-sdk'
import Keypair from 'stellar-sdk'
import { twMerge } from 'tailwind-merge'

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
	type: 'error' | 'success',
	path: string,
	message: string,
) {
	return redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Fetches the sequence number for a given Stellar account.
 * @param {string} secretKey - The secret key of the Stellar account.
 * @returns {Promise<number>} The sequence number of the account.
 */
export async function getAccountSequence(secretKey: string): Promise<number> {
	const server = new Server(process.env.STELLAR_NETWORK_URL!)
	const account = await server.loadAccount(
		Keypair.fromSecret(secretKey).publicKey(),
	)
	return account.sequenceNumber
}
