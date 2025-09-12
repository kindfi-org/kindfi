import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { logger } from '~/lib'
import {
	buildSocialLinks,
	deleteFolderFromBucket,
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

		const removeImage = formData.get('removeImage') === 'true'

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
		} else if (removeImage) {
			// Remove image from the database
			updateData.image_url = null

			if (slug) {
				try {
					// Delete all files in the project's thumbnail folder
					await deleteFolderFromBucket(supabase, 'project_thumbnails', slug)
				} catch (e) {
					console.warn('Failed to cleanup thumbnails:', (e as Error).message)
				}
			}
		}

		// Update the project record in the database
		const { error: updateError } = await supabase
			.from('projects')
			.update(updateData)
			.eq('id', projectId)

		if (updateError) {
			logger.error({
				eventType: 'Project Update Error',
				error: updateError.message,
				details: updateError,
			})
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
		logger.error({
			eventType: 'Project Update Error',
			error: err instanceof Error ? err.message : 'Unknown error',
			details: err,
		})
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
