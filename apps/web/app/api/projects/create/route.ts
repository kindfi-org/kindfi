import { createSupabaseServerClient } from '@packages/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { InsertProjectPayload } from '~/lib/types/project/create-project.types'
import { getSocialTypeFromUrl } from '~/lib/utils/project-utils'

export async function POST(req: Request) {
	try {
		const body = await req.json()

		const {
			title,
			description,
			targetAmount,
			minimumInvestment,
			image,
			website,
			socialLinks,
			location,
			category,
			tags,
		} = body

		const supabase = await createSupabaseServerClient()

		// Build the insert object with required fields
		const insertData: InsertProjectPayload = {
			title,
			description, // optional
			target_amount: targetAmount,
			min_investment: minimumInvestment,
			project_location: location, // optional
			category_id: category, // optional
			// TODO: Replace with authenticated user ID after auth changes from issue #44. - @derianrddev
			kindler_id: '00000000-0000-0000-0000-000000000001',
		}

		// Add image_url if available
		if (image?.relativePath || image?.path) {
			insertData.image_url = image.relativePath ?? image.path
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

		// Insert project and return its ID
		const { data: project, error: projectError } = await supabase
			.from('projects')
			.insert(insertData)
			.select('id')
			.single()

		if (projectError) {
			console.error(projectError)
			return NextResponse.json({ error: projectError.message }, { status: 500 })
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

		// Retrieve the generated slug for the new project
		const { data: projectWithSlug, error: fetchSlugError } = await supabase
			.from('projects')
			.select('slug')
			.eq('id', project.id)
			.single()

		if (fetchSlugError) {
			console.error(fetchSlugError)
			return NextResponse.json(
				{ error: fetchSlugError.message },
				{ status: 500 },
			)
		}

		// Return title and slug to the client
		return NextResponse.json(
			{ title, slug: projectWithSlug.slug },
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
