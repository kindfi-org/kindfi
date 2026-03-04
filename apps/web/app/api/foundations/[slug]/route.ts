import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	validateFoundedYear,
	validateOptionalString,
	validateOptionalUrl,
	validateRequiredString,
	validateSocialLinks,
	foundationValidationLimits,
} from '~/lib/validation/foundation-api'
import { uploadFoundationLogo } from '~/lib/utils/project-utils'

export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	try {
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { slug } = await params
		if (!slug) {
			return NextResponse.json(
				{ error: 'Foundation slug is required' },
				{ status: 400 },
			)
		}

		const supabase = supabaseServiceRole

		// Fetch foundation and verify current user is the founder (single query)
		const { data: foundation, error: fetchError } = await supabase
			.from('foundations')
			.select('id, founder_id')
			.eq('slug', slug)
			.maybeSingle()

		if (fetchError) {
			console.error('Foundation fetch error:', fetchError)
			return NextResponse.json(
				{ error: fetchError.message ?? 'Failed to load foundation' },
				{ status: 500 },
			)
		}

		if (!foundation) {
			return NextResponse.json(
				{ error: 'Foundation not found' },
				{ status: 404 },
			)
		}

		if (foundation.founder_id !== userId) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const formData = await req.formData()
		const nameRaw = formData.get('name')
		const descriptionRaw = formData.get('description')
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
		if (!validateFoundedYear(foundedYear)) {
			return NextResponse.json(
				{ error: 'Founded year must be between 1900 and current year' },
				{ status: 400 },
			)
		}

		const name = String(nameRaw).trim()
		const description = String(descriptionRaw).trim()

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

		const updatePayload: Record<string, unknown> = {
			name,
			description,
			founded_year: foundedYear,
			mission: mission || null,
			vision: vision || null,
			website_url: websiteUrl || null,
			social_links: socialLinks,
			updated_at: new Date().toISOString(),
		}

		const { error: updateError } = await supabase
			.from('foundations')
			.update(updatePayload)
			.eq('id', foundation.id)

		if (updateError) {
			console.error('Foundation update error:', updateError)
			return NextResponse.json(
				{ error: updateError.message ?? 'Failed to update foundation' },
				{ status: 500 },
			)
		}

		if (logo instanceof File && logo.size > 0) {
			const logoUrl = await uploadFoundationLogo(slug, logo, supabase)
			if (logoUrl) {
				const { error: logoUpdateError } = await supabase
					.from('foundations')
					.update({
						logo_url: logoUrl,
						updated_at: new Date().toISOString(),
					})
					.eq('id', foundation.id)

				if (logoUpdateError) {
					console.error('Logo update error:', logoUpdateError)
					// Do not fail the whole request; main update succeeded
				}
			}
		}

		return NextResponse.json({ slug }, { status: 200 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
