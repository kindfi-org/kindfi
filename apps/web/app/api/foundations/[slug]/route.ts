import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
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
		const name = formData.get('name') as string | null
		const description = formData.get('description') as string | null
		const foundedYearRaw = formData.get('foundedYear')
		const foundedYear =
			typeof foundedYearRaw === 'string'
				? Number.parseInt(foundedYearRaw, 10)
				: null
		const mission = (formData.get('mission') as string) || null
		const vision = (formData.get('vision') as string) || null
		const websiteUrl = (formData.get('websiteUrl') as string) || null
		const socialLinksRaw = formData.get('socialLinks') as string | null
		let socialLinks: Record<string, string> = {}
		if (socialLinksRaw) {
			try {
				socialLinks = JSON.parse(socialLinksRaw) as Record<string, string>
			} catch {
				// Invalid JSON, use empty object
			}
		}
		const logo = formData.get('logo') as File | null

		if (
			!name ||
			!description ||
			foundedYear == null ||
			Number.isNaN(foundedYear)
		) {
			return NextResponse.json(
				{ error: 'Missing required fields: name, description, foundedYear' },
				{ status: 400 },
			)
		}

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
