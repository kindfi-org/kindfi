import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { uploadFoundationLogo } from '~/lib/utils/project-utils'
import { createFoundationFormSchema } from '~/lib/schemas/foundation-create.schemas'
import { validateRequest } from '~/lib/utils/validation'

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

		const formDataObj = {
			name: formData.get('name') ?? '',
			description: formData.get('description') ?? '',
			slug: formData.get('slug') ?? '',
			foundedYear: formData.get('foundedYear') ?? '',
			mission: formData.get('mission') ?? undefined,
			vision: formData.get('vision') ?? undefined,
			websiteUrl: formData.get('websiteUrl') ?? undefined,
			socialLinks: (() => {
				const raw = formData.get('socialLinks') as string | null
				if (!raw) return {}
				try {
					return JSON.parse(raw) as Record<string, string>
				} catch {
					return {}
				}
			})(),
		}
		const validation = validateRequest(createFoundationFormSchema, formDataObj)
		if (!validation.success) {
			return validation.response
		}
		const {
			name,
			description,
			slug,
			foundedYear,
			mission,
			vision,
			websiteUrl,
			socialLinks,
		} = validation.data
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
