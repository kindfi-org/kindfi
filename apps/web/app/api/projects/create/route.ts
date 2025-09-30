import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '~/lib'
import { nextAuthOption } from '~/lib/auth/auth-options'
import {
	buildSocialLinks,
	parseFormData,
	uploadProjectImage,
	upsertTags,
} from '~/lib/utils/project-utils'

export async function POST(req: Request) {
	try {
		const supabase = await createSupabaseServerClient()

		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

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
			logger.error({
				eventType: 'Project Insertion Error',
				error: insertError?.message,
				details: insertError,
			})
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
					logger.error({
						eventType: 'Project Image URL Update Error',
						error: updateImageError.message,
						details: updateImageError,
					})
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
		logger.error({
			eventType: 'Project Creation Error',
			details: err,
		})
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
