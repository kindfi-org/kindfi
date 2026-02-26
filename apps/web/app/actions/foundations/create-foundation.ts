'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

export interface CreateFoundationInput {
	name: string
	description: string
	slug: string
	foundedYear: number
	mission?: string
	vision?: string
	websiteUrl?: string
	socialLinks?: Record<string, string>
}

export async function createFoundation(
	input: CreateFoundationInput,
): Promise<{ success: boolean; slug?: string; error?: string }> {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user) {
			return { success: false, error: 'Unauthorized' }
		}

		const supabase = await createSupabaseServerClient()

		// Check if slug already exists
		const { data: existing } = await supabase
			.from('foundations')
			.select('id')
			.eq('slug', input.slug)
			.single()

		if (existing) {
			return { success: false, error: 'Slug already exists' }
		}

		// Create foundation
		const { data, error } = await supabase
			.from('foundations')
			.insert({
				name: input.name,
				description: input.description,
				slug: input.slug,
				founder_id: session.user.id,
				founded_year: input.foundedYear,
				mission: input.mission || null,
				vision: input.vision || null,
				website_url: input.websiteUrl || null,
				social_links: input.socialLinks || {},
			})
			.select('slug')
			.single()

		if (error) {
			console.error('Error creating foundation:', error)
			return { success: false, error: error.message }
		}

		revalidatePath('/foundations')
		revalidatePath(`/foundations/${data.slug}`)

		return { success: true, slug: data.slug }
	} catch (error) {
		console.error('Unexpected error creating foundation:', error)
		return {
			success: false,
			error: 'An unexpected error occurred',
		}
	}
}
