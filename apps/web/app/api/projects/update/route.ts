import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { TablesUpdate } from '@services/supabase'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { authorizeProjectManage } from '~/lib/api/authorize-project-manage'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { projectUpdateFormSchema } from '~/lib/schemas/project.schemas'
import { upsertManualTranslation } from '~/lib/services/content-translation/server'
import {
	buildSocialLinks,
	deleteFolderFromBucket,
	parseFormData,
	uploadProjectImage,
	upsertTags,
} from '~/lib/utils/project-utils'
import { validateRequest } from '~/lib/utils/validation'

export async function PATCH(req: Request) {
	try {
		// Ensure the request is authenticated before processing
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await req.formData()
		const parsed = {
			...parseFormData(formData),
			removeImage: formData.get('removeImage') === 'true',
		}
		const validation = validateRequest(projectUpdateFormSchema, parsed)
		if (!validation.success) return validation.response
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
			removeImage,
			sourceLocale,
			translation,
		} = validation.data

		// Verify user has permission to update this project
		const auth = await authorizeProjectManage(userId, projectId)
		if (!auth.ok) {
			return NextResponse.json(
				{ error: auth.status === 404 ? 'Project not found' : 'Forbidden' },
				{ status: auth.status },
			)
		}

		// Use service role client for project update with manual authorization check
		// This bypasses RLS but we've already verified the user has permission
		const supabase = supabaseServiceRole

		// Prepare project update payload
		const updateData: TablesUpdate<'projects'> = {
			title,
			description,
			target_amount: targetAmount,
			min_investment: minimumInvestment,
			project_location: location,
			category_id: category,
			social_links: buildSocialLinks(website, socialLinks),
			source_locale: sourceLocale,
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
					logger.warn('Failed to cleanup thumbnails:', (e as Error).message)
				}
			}
		}

		// Update the project record in the database
		const { error: updateError } = await supabase
			.from('projects')
			.update(updateData)
			.eq('id', projectId)

		if (updateError) {
			logger.error(updateError)
			return NextResponse.json({ error: updateError.message }, { status: 500 })
		}

		// Remove old tag relationships before inserting updated ones
		await supabase.from('project_tag_relationships').delete().eq('project_id', projectId)

		// Upsert new tag relationships
		await upsertTags(projectId, tags ?? [], supabase)

		if (translation) {
			await upsertManualTranslation('project', projectId, sourceLocale, translation)
		}

		return NextResponse.json({ message: 'Project updated successfully' }, { status: 200 })
	} catch (err) {
		logger.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
