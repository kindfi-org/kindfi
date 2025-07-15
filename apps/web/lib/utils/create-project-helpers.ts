import { countries } from '../constants/projects/country.constant'
import type { CountryOption } from '../types/project/create-project.types'

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

/**
 * Transforms the countries object to display format for the combobox
 */
export function getCountryOptions(): CountryOption[] {
	return Object.entries(countries).map(([key, country]) => ({
		alpha3: country.alpha3,
		alpha2: country.alpha2,
		// "costaRica" → "Costa Rica"
		name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
	}))
}

/**
 * Finds a country by its alpha3 code
 */
export function findCountryByAlpha3(alpha3: string): CountryOption | undefined {
	const countryOptions = getCountryOptions()
	return countryOptions.find((c) => c.alpha3 === alpha3)
}

/**
 * Gets the alpha2 code from alpha3 code for flag display
 */
export function getAlpha2FromAlpha3(alpha3: string): string | undefined {
	const country = Object.values(countries).find((c) => c.alpha3 === alpha3)
	return country?.alpha2
}

/**
 * Checks whether a given URL is from an allowed social media domain.
 */
export function isAllowedSocialUrl(url: string): boolean {
	const allowed = [
		'twitter.com',
		'linkedin.com',
		'github.com',
		'facebook.com',
		'instagram.com',
		'youtube.com',
		't.me',
		'discord.gg',
		'medium.com',
		'tiktok.com',
	]
	try {
		const { hostname } = new URL(url)
		return allowed.some((d) => hostname === d || hostname.endsWith(`.${d}`))
	} catch {
		return false
	}
}
