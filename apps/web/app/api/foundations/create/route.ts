import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	validateFoundedYear,
	validateOptionalString,
	validateOptionalUrl,
	validateRequiredString,
	validateSlug,
	validateSocialLinks,
	foundationValidationLimits,
} from '~/lib/validation/foundation-api'
import { uploadFoundationLogo } from '~/lib/utils/project-utils'

export async function POST(req: Request) {
	try {
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check user role - only admin and creator can create foundations
		const { data: profileData, error: profileError } = await supabaseServiceRole
			.from('profiles')
			.select('role')
			.eq('id', userId)
			.single()

		if (profileError || !profileData) {
			console.error('Profile lookup error:', {
				error: profileError,
				userId,
			})
			return NextResponse.json(
				{
					error: 'Failed to verify user permissions',
					details: profileError?.message || 'Profile not found',
				},
				{ status: 403 },
			)
		}

		const userRole = profileData.role
		if (userRole !== 'admin' && userRole !== 'creator') {
			return NextResponse.json(
				{
					error: 'Forbidden',
					message: 'Only creators and administrators can create foundations',
				},
				{ status: 403 },
			)
		}

		// Use service role client for foundation creation with manual authorization check
		const supabase = supabaseServiceRole

		const formData = await req.formData()

		// Extract and validate required fields
		const nameRaw = formData.get('name')
		const descriptionRaw = formData.get('description')
		const slugRaw = formData.get('slug')
		const foundedYearRaw = formData.get('foundedYear')
		const foundedYear =
			typeof foundedYearRaw === 'string'
				? Number.parseInt(foundedYearRaw, 10)
				: Number(foundedYearRaw)

		if (
			!validateRequiredString(nameRaw, foundationValidationLimits.MAX_NAME_LENGTH)
		) {
			return NextResponse.json(
				{ error: 'Name is required and must be at most 200 characters' },
				{ status: 400 },
			)
		}
		if (
			!validateRequiredString(
				descriptionRaw,
				foundationValidationLimits.MAX_DESCRIPTION_LENGTH,
			)
		) {
			return NextResponse.json(
				{
					error:
						'Description is required and must be at most 5000 characters',
				},
				{ status: 400 },
			)
		}
		if (!validateSlug(slugRaw)) {
			return NextResponse.json(
				{
					error:
						'Slug must be 3–30 characters, lowercase alphanumeric with hyphens',
				},
				{ status: 400 },
			)
		}
		if (!validateFoundedYear(foundedYear)) {
			return NextResponse.json(
				{ error: 'Founded year must be between 1900 and current year' },
				{ status: 400 },
			)
		}

		const name = String(nameRaw).trim()
		const description = String(descriptionRaw).trim()
		const slug = String(slugRaw).trim().toLowerCase()

		const missionRaw = formData.get('mission')
		const visionRaw = formData.get('vision')
		const websiteUrlRaw = formData.get('websiteUrl')
		if (
			!validateOptionalString(
				missionRaw,
				foundationValidationLimits.MAX_MISSION_LENGTH,
			)
		) {
			return NextResponse.json(
				{ error: 'Mission must be at most 2000 characters' },
				{ status: 400 },
			)
		}
		if (
			!validateOptionalString(
				visionRaw,
				foundationValidationLimits.MAX_VISION_LENGTH,
			)
		) {
			return NextResponse.json(
				{ error: 'Vision must be at most 2000 characters' },
				{ status: 400 },
			)
		}
		if (websiteUrlRaw != null && websiteUrlRaw !== '' && !validateOptionalUrl(websiteUrlRaw)) {
			return NextResponse.json(
				{ error: 'Website URL must be a valid http(s) URL' },
				{ status: 400 },
			)
		}

		const socialLinksRaw = formData.get('socialLinks')
		let socialLinks: Record<string, string> = {}
		if (socialLinksRaw != null && socialLinksRaw !== '') {
			try {
				const parsed = JSON.parse(String(socialLinksRaw)) as unknown
				const result = validateSocialLinks(parsed)
				if (!result.ok) {
					return NextResponse.json({ error: result.error }, { status: 400 })
				}
				socialLinks = result.value
			} catch {
				return NextResponse.json(
					{ error: 'Invalid socialLinks JSON' },
					{ status: 400 },
				)
			}
		}

		const mission =
			missionRaw != null && String(missionRaw).trim() !== ''
				? String(missionRaw).trim()
				: null
		const vision =
			visionRaw != null && String(visionRaw).trim() !== ''
				? String(visionRaw).trim()
				: null
		const websiteUrl =
			websiteUrlRaw != null && String(websiteUrlRaw).trim() !== ''
				? String(websiteUrlRaw).trim()
				: null

		const logo = formData.get('logo') as File | null

		// Check if slug already exists
		const { data: existing } = await supabase
			.from('foundations')
			.select('id')
			.eq('slug', slug)
			.single()

		if (existing) {
			return NextResponse.json(
				{ error: 'Slug already exists' },
				{ status: 400 },
			)
		}

		// Prepare foundation data to insert
		const insertData: TablesInsert<'foundations'> = {
			name,
			description,
			slug,
			founder_id: userId,
			founded_year: foundedYear,
			mission: mission || null,
			vision: vision || null,
			website_url: websiteUrl || null,
			social_links: socialLinks,
		}

		// Insert new foundation and retrieve its ID and slug
		const { data: foundation, error: insertError } = await supabase
			.from('foundations')
			.insert(insertData)
			.select('id, slug')
			.single()

		if (insertError || !foundation) {
			console.error(insertError)
			return NextResponse.json(
				{ error: insertError?.message || 'Failed to create foundation' },
				{ status: 500 },
			)
		}

		// If a logo was provided, upload it and update the foundation record
		// Use service role client for storage operations (we've already verified permissions)
		if (logo instanceof File) {
			if (!foundation.slug) throw new Error('Foundation slug is missing')

			const logoUrl = await uploadFoundationLogo(
				foundation.slug,
				logo,
				supabase,
			)

			if (logoUrl) {
				const { error: updateLogoError } = await supabase
					.from('foundations')
					.update({ logo_url: logoUrl })
					.eq('id', foundation.id)

				if (updateLogoError) {
					console.error(updateLogoError)
					return NextResponse.json(
						{ error: updateLogoError.message },
						{ status: 500 },
					)
				}
			}
		}

		return NextResponse.json({ slug: foundation.slug }, { status: 201 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
