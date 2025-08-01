import { createSupabaseServerClient } from '@packages/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { InsertProjectPayload } from '~/lib/types/project/create-project.types'
import { getSocialTypeFromUrl } from '~/lib/utils/project-utils'

export async function POST(req: Request) {
	try {
		const supabase = await createSupabaseServerClient()
		const formData = await req.formData()

		const title = formData.get('title') as string
		const description = formData.get('description') as string
		const targetAmount = Number(formData.get('targetAmount'))
		const minimumInvestment = Number(formData.get('minimumInvestment'))
		const website = formData.get('website') as string
		const location = formData.get('location') as string
		const category = formData.get('category') as string
		const tags = JSON.parse(formData.get('tags') as string)
		const socialLinks = JSON.parse(formData.get('socialLinks') as string)
		const image = formData.get('image') as File | null

		// Build the insert object with required fields
		const insertData: InsertProjectPayload = {
			title,
			description,
			target_amount: targetAmount,
			min_investment: minimumInvestment,
			project_location: location,
			category_id: category,
			// TODO: Replace with authenticated user ID after auth changes from issue #44. - @derianrddev
			kindler_id: '00000000-0000-0000-0000-000000000001',
		}

		// Process social links only if website or socialLinks array is present
		const hasSocial = website || (socialLinks?.length ?? 0) > 0
		if (hasSocial) {
			const socialLinksObject = Object.fromEntries(
				(socialLinks || [])
					.map((url: string) => {
						const key = getSocialTypeFromUrl(url)
						return key ? [key, url] : null
					})
					.filter(Boolean) as [string, string][],
			)

			// Include website and parsed social links in insertData
			insertData.social_links = {
				...(website && { website }),
				...socialLinksObject,
			}
		}

		// Insert project and return its ID ans slug
		const { data: project, error: insertError } = await supabase
			.from('projects')
			.insert(insertData)
			.select('id, slug')
			.single()

		if (insertError || !project) {
			console.error(insertError)
			return NextResponse.json({ error: insertError?.message }, { status: 500 })
		}

		const projectId = project.id

		// Upload image to Supabase Storage if a file is provided
		let imageUrl: string | null = null

		if (image) {
			// Convert the File object to a binary buffer
			const arrayBuffer = await image.arrayBuffer()
			const buffer = new Uint8Array(arrayBuffer)

			// Create a unique filename using projectId
			const extension = image.name.split('.').pop()
			const filename = `${projectId}/thumbnail.${extension}`

			// Upload the image to the 'project_thumbnails' bucket
			const { error: uploadError } = await supabase.storage
				.from('project_thumbnails')
				.upload(filename, buffer, {
					contentType: image.type,
					upsert: true,
				})

			if (uploadError) {
				console.error(uploadError)
				return NextResponse.json(
					{ error: uploadError.message },
					{ status: 500 },
				)
			}

			// Get the public URL of the uploaded image
			const { data: publicUrlData } = supabase.storage
				.from('project_thumbnails')
				.getPublicUrl(filename)

			imageUrl = publicUrlData?.publicUrl || null

			// Update the corresponding project record with the image URL
			if (imageUrl) {
				const { error: updateImageError } = await supabase
					.from('projects')
					.update({ image_url: imageUrl })
					.eq('id', projectId)

				if (updateImageError) {
					console.error(updateImageError)
					return NextResponse.json(
						{ error: updateImageError.message },
						{ status: 500 },
					)
				}
			}
		}

		// Insert tags if provided
		if (Array.isArray(tags) && tags.length > 0) {
			const tagNames = tags.map((t: { name: string }) =>
				t.name.toLowerCase().trim(),
			)

			const tagColors = Object.fromEntries(
				tags.map((t: { name: string; color: string }) => [
					t.name.toLowerCase(),
					t.color,
				]),
			)

			// Upsert tags to ensure no duplicates
			const { data: insertedTags, error: tagError } = await supabase
				.from('project_tags')
				.upsert(
					tagNames.map((name: string) => ({
						name,
						color: tagColors[name] ?? '#888888',
					})),
					{ onConflict: 'name' },
				)
				.select('id, name')

			if (tagError) {
				console.error(tagError)
				return NextResponse.json({ error: tagError.message }, { status: 500 })
			}

			// Create relationships between the project and tags
			const { error: relError } = await supabase
				.from('project_tag_relationships')
				.insert(
					insertedTags.map((tag) => ({
						project_id: project.id,
						tag_id: tag.id,
					})),
				)

			if (relError) {
				console.error(relError)
				return NextResponse.json({ error: relError.message }, { status: 500 })
			}
		}

		return NextResponse.json({ title, slug: project.slug }, { status: 200 })
	} catch (err) {
		console.error(err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
