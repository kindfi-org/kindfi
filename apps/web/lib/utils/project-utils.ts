import { countries } from '../constants/projects/countries.constant'
import type {
	BasicProjectInfo,
	CountryOption,
	CreateProjectFormData,
} from '../types/project/create-project.types'

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
 * Convert alpha-3 country code to full country name
 */
export function getCountryNameFromAlpha3(alpha3Code: string): string {
	const countryEntry = Object.entries(countries).find(
		([_, country]) => country.alpha3 === alpha3Code,
	)

	if (!countryEntry) {
		return alpha3Code // Return the code if not found
	}

	const [key] = countryEntry
	// Convert camelCase to proper name: "unitedStates" → "United States"
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

/**
 * Checks whether a given URL is from an allowed social media domain.
 */
export function isAllowedSocialUrl(url: string): boolean {
	const allowed = [
		'x.com',
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

/**
 * Infers the social media platform type from a given URL by matching its domain.
 * Returns a string key like 'twitter', 'facebook', etc., used to select icons and labels.
 * Falls back to 'website' if no known platform is matched.
 */
export function getSocialTypeFromUrl(url: string): string | null {
	try {
		const domain = new URL(url).hostname.toLowerCase()

		if (domain.includes('x.com') || domain.includes('twitter.com'))
			return 'twitter'
		if (domain.includes('facebook.com')) return 'facebook'
		if (domain.includes('instagram.com')) return 'instagram'
		if (domain.includes('linkedin.com')) return 'linkedin'
		if (domain.includes('github.com')) return 'github'
		if (domain.includes('youtube.com')) return 'youtube'
		if (domain.includes('t.me')) return 'telegram'
		if (domain.includes('discord.gg')) return 'discord'
		if (domain.includes('medium.com')) return 'medium'
		if (domain.includes('tiktok.com')) return 'tiktok'

		return 'website' // Default for other domains
	} catch {
		return null
	}
}

/**
 * Normalizes a project object into default form values expected by CreateProjectFormData.
 * Useful for pre-filling forms when editing an existing project.
 * Ensures proper fallback values and formats social links correctly.
 */
export function normalizeProjectToFormDefaults(
	project: BasicProjectInfo,
): CreateProjectFormData {
	return {
		title: project.title ?? '',
		description: project.description ?? '',
		targetAmount: project.goal ?? 0,
		minimumInvestment: project.minInvestment ?? 0,
		image: project.image ?? null,
		website: project.socialLinks?.website ?? '',
		socialLinks: Object.entries(project.socialLinks || {})
			.filter(([key]) => key !== 'website')
			.map(([, url]) => String(url)),
		location: project.location ?? '',
		category: project.category?.id ?? '',
		tags: project.tags ?? [],
	}
}
