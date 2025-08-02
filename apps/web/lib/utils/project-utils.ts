import type { TypedSupabaseClient } from '@packages/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { countries } from '../constants/projects/countries.constant'
import type {
	BasicProjectInfo,
	CountryOption,
	CreateProjectFormData,
	Tag,
} from '../types/project/create-project.types'

/**
 * Checks if a string is a syntactically valid URL.
 * Uses the built-in URL constructor to validate the input format.
 *
 * @param url - The string to validate
 * @returns True if the string is a valid URL, otherwise false
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
 * Transforms the internal `countries` constant into an array of options
 * suitable for use in UI components like dropdowns or combo boxes.
 *
 * Converts camelCase country keys to proper formatted names (e.g. "costaRica" → "Costa Rica").
 *
 * @returns An array of country options with alpha codes and readable names
 */
export function getCountryOptions(): CountryOption[] {
	return Object.entries(countries).map(([key, country]) => ({
		alpha3: country.alpha3,
		alpha2: country.alpha2,
		name: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()),
	}))
}

/**
 * Looks up a country by its alpha-3 code (ISO 3166-1).
 * Uses the result of `getCountryOptions()` to match the code.
 *
 * @param alpha3 - The 3-letter country code (e.g. "USA", "CRI")
 * @returns The matching CountryOption object or undefined if not found
 */
export function findCountryByAlpha3(alpha3: string): CountryOption | undefined {
	const countryOptions = getCountryOptions()
	return countryOptions.find((c) => c.alpha3 === alpha3)
}

/**
 * Maps an alpha-3 country code to its corresponding alpha-2 code.
 * Useful for displaying country flags based on ISO 3166-1 alpha-2 codes.
 *
 * @param alpha3 - The 3-letter country code (e.g. "COL")
 * @returns The 2-letter alpha-2 code or undefined if not found
 */
export function getAlpha2FromAlpha3(alpha3: string): string | undefined {
	const country = Object.values(countries).find((c) => c.alpha3 === alpha3)
	return country?.alpha2
}

/**
 * Converts an alpha-3 country code to its human-readable country name.
 * Falls back to returning the code itself if no match is found.
 *
 * @param alpha3Code - The 3-letter country code to convert
 * @returns The formatted country name (e.g. "Costa Rica"), or the original code if not found
 */
export function getCountryNameFromAlpha3(alpha3Code: string): string {
	const countryEntry = Object.entries(countries).find(
		([_, country]) => country.alpha3 === alpha3Code,
	)

	if (!countryEntry) {
		return alpha3Code
	}

	const [key] = countryEntry
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

/**
 * Checks whether a given URL belongs to a known and allowed social media domain.
 * Validates against a predefined whitelist of trusted platforms.
 *
 * @param url - The URL string to check
 * @returns True if the URL matches one of the allowed domains, otherwise false
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
 * Infers the social media platform key from a URL by matching common domains.
 * Used to classify social links in the UI and API.
 *
 * @param url - The URL of the social media link
 * @returns A lowercase platform key (e.g. "twitter", "youtube") or "website" as default;
 *          returns null if URL parsing fails
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

		return 'website'
	} catch {
		return null
	}
}

/**
 * Normalizes a backend project object into a format that matches
 * the CreateProjectFormData interface used in frontend forms.
 *
 * Ensures compatibility with React Hook Form default values and prevents
 * uncontrolled input issues by providing sensible fallbacks.
 *
 * @param project - A raw project object from the database
 * @returns A structured object suitable for pre-filling a project form
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

/**
 * Parses FormData from a multipart/form request into a structured object.
 * Converts numeric fields, parses JSON strings, and casts image to File.
 *
 * @param formData - The FormData object from a POST or PATCH request
 * @returns An object containing normalized values for project fields
 */
export function parseFormData(formData: FormData) {
	return {
		projectId: formData.get('projectId') as string | null,
		slug: formData.get('slug') as string | null,
		title: formData.get('title') as string,
		description: formData.get('description') as string,
		targetAmount: Number(formData.get('targetAmount')),
		minimumInvestment: Number(formData.get('minimumInvestment')),
		website: formData.get('website') as string,
		location: formData.get('location') as string,
		category: formData.get('category') as string,
		tags: JSON.parse(formData.get('tags') as string),
		socialLinks: JSON.parse(formData.get('socialLinks') as string),
		image: formData.get('image') as File | null,
	}
}

/**
 * Builds a normalized object of social links, grouped by platform.
 * Automatically infers the platform key from the URL.
 *
 * @param website - Optional website URL
 * @param socialLinks - Array of social media URLs
 * @returns A record of platform keys mapped to their respective URLs
 */
export function buildSocialLinks(
	website?: string,
	socialLinks?: string[],
): Record<string, string> {
	const links = Object.fromEntries(
		(socialLinks || [])
			.map((url: string) => {
				const key = getSocialTypeFromUrl(url)
				return key ? [key, url] : null
			})
			.filter(Boolean) as [string, string][],
	)

	return {
		...(website && { website }),
		...links,
	}
}

/**
 * Uploads a project's thumbnail image to the Supabase Storage bucket.
 *
 * Deletes all existing images under the slug folder and uploads a new one
 * with a unique UUID-based filename. Returns the public URL of the uploaded image.
 *
 * @param slug - The slug of the project (used as folder path in the bucket)
 * @param image - The image File to upload
 * @param supabase - The Supabase client instance
 * @returns The public URL of the uploaded image, or null if upload failed
 * @throws If listing, deleting, or uploading the image fails
 */
export async function uploadProjectImage(
	slug: string,
	image: File,
	supabase: TypedSupabaseClient,
): Promise<string | null> {
	const { data: existingFiles, error: listError } = await supabase.storage
		.from('project_thumbnails')
		.list(slug, { limit: 100 })

	console.log(existingFiles)

	if (listError) throw new Error(`Failed to list images: ${listError.message}`)

	if (existingFiles && existingFiles.length > 0) {
		const filesToDelete = existingFiles.map((file) => `${slug}/${file.name}`)
		console.log(filesToDelete)
		const { error: deleteError } = await supabase.storage
			.from('project_thumbnails')
			.remove(filesToDelete)

		if (deleteError)
			throw new Error(`Failed to delete old images: ${deleteError.message}`)
	}

	const arrayBuffer = await image.arrayBuffer()
	const buffer = new Uint8Array(arrayBuffer)

	const extension = image.name.split('.').pop()
	const filename = `${slug}/${uuidv4()}.${extension}`

	const { error: uploadError } = await supabase.storage
		.from('project_thumbnails')
		.upload(filename, buffer, {
			contentType: image.type,
			upsert: false,
		})

	if (uploadError) throw new Error(uploadError.message)

	const { data: publicUrlData } = supabase.storage
		.from('project_thumbnails')
		.getPublicUrl(filename)

	return publicUrlData?.publicUrl || null
}

/**
 * Inserts or updates tags in the 'project_tags' table and creates relationships
 * between those tags and the specified project in 'project_tag_relationships'.
 *
 * @param projectId - The ID of the project to associate with the tags
 * @param tags - Array of tag objects (label and color)
 * @param supabase - The Supabase client instance
 * @throws If any insert or relationship creation operation fails
 */
export async function upsertTags(
	projectId: string,
	tags: Tag[],
	supabase: TypedSupabaseClient,
): Promise<void> {
	const tagNames = tags.map((t) => t.name.toLowerCase().trim())
	const tagColors = Object.fromEntries(
		tags.map((t) => [t.name.toLowerCase(), t.color]),
	)

	const { data: insertedTags, error: tagError } = await supabase
		.from('project_tags')
		.upsert(
			tagNames.map((name) => ({
				name,
				color: tagColors[name] ?? '#888888',
			})),
			{ onConflict: 'name,color' },
		)
		.select('id, name')

	if (tagError) throw new Error(tagError.message)

	const { error: relError } = await supabase
		.from('project_tag_relationships')
		.insert(
			insertedTags.map((tag) => ({
				project_id: projectId,
				tag_id: tag.id,
			})),
		)

	if (relError) throw new Error(relError.message)
}
