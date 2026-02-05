import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	buildSocialLinks,
	parseFormData,
	uploadProjectImage,
	upsertTags,
} from '~/lib/utils/project-utils'

export async function POST(req: Request) {
	try {
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		// Check user role - only admin and creator can create projects
		// Use service role client to bypass RLS for permission check
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
					message: 'Only creators and administrators can create projects',
				},
				{ status: 403 },
			)
		}

		// Use service role client for project creation with manual authorization check
		// This bypasses RLS but we've already verified the user has permission
		const supabase = supabaseServiceRole

		const formData = await req.formData()

		// Extract fields from multipart form data
		const {
			title,
			description,
			targetAmount,
			minimumInvestment,
			website,
			location,
			category,
			tags,
			socialLinks,
			image,
		} = parseFormData(formData)

		// Prepare project data to insert
		const insertData: TablesInsert<'projects'> = {
			title,
			description,
			target_amount: targetAmount,
			min_investment: minimumInvestment,
			project_location: location,
			category_id: category,
			kindler_id: userId,
			social_links: buildSocialLinks(website, socialLinks),
		}

		// Insert new project and retrieve its ID and slug
		const { data: project, error: insertError } = await supabase
			.from('projects')
			.insert(insertData)
			.select('id, slug')
			.single()

		if (insertError || !project) {
			console.error(insertError)
			return NextResponse.json({ error: insertError?.message }, { status: 500 })
		}

		// If an image was provided, upload it and update the project record
		if (image instanceof File) {
			if (!project.slug) throw new Error('Project slug is missing')

			const imageUrl = await uploadProjectImage(project.slug, image, supabase)

			if (imageUrl) {
				const { error: updateImageError } = await supabase
					.from('projects')
					.update({ image_url: imageUrl })
					.eq('id', project.id)

				if (updateImageError) {
					console.error(updateImageError)
					return NextResponse.json(
						{ error: updateImageError.message },
						{ status: 500 },
					)
				}
			}
		}

		// Create tag relationships for the new project
		await upsertTags(project.id, tags, supabase)

		return NextResponse.json({ slug: project.slug }, { status: 201 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
