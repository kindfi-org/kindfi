import { createSupabaseServerClient } from '@packages/lib/supabase/server'
import type { TablesInsert } from '@services/supabase'
import { NextResponse } from 'next/server'
import {
	buildSocialLinks,
	parseFormData,
	uploadProjectImage,
	upsertTags,
} from '~/lib/utils/project-utils'

export async function POST(req: Request) {
	try {
		const supabase = await createSupabaseServerClient()
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
			// TODO: Replace with authenticated user ID after auth changes from issue #44. - @derianrddev
			kindler_id: '00000000-0000-0000-0000-000000000001',
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

		return NextResponse.json({ title, slug: project.slug }, { status: 200 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
