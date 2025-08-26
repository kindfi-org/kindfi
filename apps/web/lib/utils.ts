import { appEnvConfig } from '@packages/lib'
import type { AppEnvInterface } from '@packages/lib/types'
import { type ClassValue, clsx } from 'clsx'
import { redirect } from 'next/navigation'
import Server from 'stellar-sdk'
import Keypair from 'stellar-sdk'
import { twMerge } from 'tailwind-merge'

/**
 * Generates a redirect URL with an encoded message as a query parameter.
 *
 * @param type - The type of message, either 'error' or 'success'.
 * @param path - The base path for the redirect.
 * @param message - The message to be encoded and included in the redirect URL.
 * @returns The redirect URL with the encoded message.
 */
export function encodedRedirect(
	type: 'error' | 'success',
	path: string,
	message: string,
) {
	return redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

/**
 * Combines multiple class names into a single string, merging Tailwind CSS classes intelligently.
 *
 * @param {...ClassValue[]} inputs - An array of class values to be combined.
 * @returns {string} - A single string with the combined class names.
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Builds the URL to the projects page filtered by category slug.
 */
export function buildProjectsCategoryUrl(categorySlug: string): string {
	return `/projects?category=${encodeURIComponent(categorySlug)}`
}

/**
 * Retrieves the sequence number of an account using the provided secret key.
 *
 * @param {string} secretKey - The secret key of the account.
 * @returns {Promise<number>} A promise that resolves to the sequence number of the account.
 */
export async function getAccountSequence(secretKey: string): Promise<number> {
	const appConfig: AppEnvInterface = appEnvConfig('web')
	const server = new Server(appConfig.stellar.networkUrl)
	const account = await server.loadAccount(
		Keypair.fromSecret(secretKey).publicKey(),
	)
	return account.sequenceNumber
}

export function getAvatarFallback(name: string | undefined): string {
	if (!name || name.trim() === '') {
		return 'U' // Default AvatarFallback for a user with undefined or empty name
	}

	const trimmedName = name.trim()
	const nameParts = trimmedName.split(/\s+/)

	if (nameParts.length === 1) {
		// Single name: return first two characters if available, otherwise first character
		return nameParts[0].length > 1
			? nameParts[0].substring(0, 2).toUpperCase()
			: nameParts[0].charAt(0).toUpperCase()
	}

	// Multiple names: return first character of first and last name
	const firstInitial = nameParts[0].charAt(0).toUpperCase()
	const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase()
	return firstInitial + lastInitial
}
