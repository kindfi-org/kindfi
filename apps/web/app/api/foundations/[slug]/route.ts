import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { foundationSlugParamSchema, foundationUpdateFormSchema } from '~/lib/schemas/foundation.schemas'
import { uploadFoundationLogo } from '~/lib/utils/project-utils'
import { validateRequest } from '~/lib/utils/validation'

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
		const slugValidation = validateRequest(foundationSlugParamSchema, { slug })
		if (!slugValidation.success) return slugValidation.response
		const { slug: validatedSlug } = slugValidation.data

		const supabase = supabaseServiceRole

		// Fetch foundation and verify current user is the founder (single query)
		const { data: foundation, error: fetchError } = await supabase
			.from('foundations')
			.select('id, founder_id')
			.eq('slug', validatedSlug)
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
		const formPayload = {
			name: formData.get('name') ?? '',
			description: formData.get('description') ?? '',
			foundedYear: (() => {
				const raw = formData.get('foundedYear')
				return typeof raw === 'string' ? Number.parseInt(raw, 10) : NaN
			})(),
			mission: (formData.get('mission') as string) || null,
			vision: (formData.get('vision') as string) || null,
			websiteUrl: (formData.get('websiteUrl') as string) || null,
			socialLinks: (() => {
				const raw = formData.get('socialLinks') as string | null
				if (!raw) return {}
				try {
					return JSON.parse(raw) as Record<string, string>
				} catch {
					return {}
				}
			})(),
			logo: formData.get('logo') as File | null,
		}
		const validation = validateRequest(foundationUpdateFormSchema, formPayload)
		if (!validation.success) return validation.response
		const { name, description, foundedYear, mission, vision, websiteUrl, socialLinks, logo } = validation.data

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

		if (logo && logo instanceof File && logo.size > 0) {
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

		return NextResponse.json({ slug: validatedSlug }, { status: 200 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
