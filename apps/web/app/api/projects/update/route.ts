import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import {
	buildSocialLinks,
	parseFormData,
	uploadProjectImage,
	upsertTags,
} from '~/lib/utils/project-utils'

export async function PATCH(req: Request) {
	try {
		const supabase = await createSupabaseServerClient()
		const formData = await req.formData()

		// Extract fields from multipart form data
		const {
			projectId,
			slug,
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

		if (!projectId) {
			return NextResponse.json(
				{ error: 'Project id is missing' },
				{ status: 400 },
			)
		}

		// Prepare project update payload
		const updateData: TablesUpdate<'projects'> = {
			title,
			description,
			target_amount: targetAmount,
			min_investment: minimumInvestment,
			project_location: location,
			category_id: category,
			social_links: buildSocialLinks(website, socialLinks),
		}

		// If the image was updated, upload new one and attach to project
		if (image instanceof File) {
			if (!slug) throw new Error('Project slug is missing')

			const imageUrl = await uploadProjectImage(slug, image, supabase)
			updateData.image_url = imageUrl
		}

		// Update the project record in the database
		const { error: updateError } = await supabase
			.from('projects')
			.update(updateData)
			.eq('id', projectId)

		if (updateError) {
			console.error(updateError)
			return NextResponse.json({ error: updateError.message }, { status: 500 })
		}

		// Remove old tag relationships before inserting updated ones
		await supabase
			.from('project_tag_relationships')
			.delete()
			.eq('project_id', projectId)

		// Upsert new tag relationships
		await upsertTags(projectId, tags, supabase)

		return NextResponse.json(
			{ message: 'Project updated successfully' },
			{ status: 200 },
		)
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
