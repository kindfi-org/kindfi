import { countries } from '~/lib/constants/projects/countries.constant'

export interface CountryCodeOption {
	code: string
	label: string
}

let cachedOptions: CountryCodeOption[] | null = null

/**
 * ISO 3166-1 alpha-2 country codes paired with a display label, derived from
 * the existing `countries.constant.ts` list used by project creation. The
 * code is the source of truth; the label is a display-only convenience and
 * must never be stored in place of the code.
 */
export function getCountryCodeOptions(): CountryCodeOption[] {
	if (cachedOptions) return cachedOptions

	cachedOptions = Object.entries(countries)
		.map(([key, country]) => ({
			code: country.alpha2,
			label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
		}))
		.sort((a, b) => a.label.localeCompare(b.label))

	return cachedOptions
}

export function isValidIsoAlpha2(code: string): boolean {
	return getCountryCodeOptions().some((option) => option.code === code.toUpperCase())
}

export function getCountryLabel(code: string): string {
	const option = getCountryCodeOptions().find((o) => o.code === code.toUpperCase())
	return option?.label ?? code
}
