'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import {
	enforceRateLimit,
	requireAuthenticatedSession,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import { createFoundationInputSchema } from '~/lib/schemas/server-actions.schemas'

const logger = new Logger()

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
	let session: Awaited<ReturnType<typeof requireAuthenticatedSession>>
	try {
		session = await requireAuthenticatedSession('createFoundation')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Unauthorized')
		return { success: false, error: failure.error }
	}

	let validated: ReturnType<typeof createFoundationInputSchema.parse>
	try {
		validated = validateInput(createFoundationInputSchema, input, 'createFoundation')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Invalid input')
		return { success: false, error: failure.error }
	}

	try {
		await enforceRateLimit(session.user.id, 'create_foundation')
	} catch (error) {
		const failure = toServerActionFailure(error, 'Too many requests. Please try again later.')
		return { success: false, error: failure.error }
	}

	try {
		const supabase = await createSupabaseServerClient()

		const { data: existing } = await supabase
			.from('foundations')
			.select('id')
			.eq('slug', validated.slug)
			.single()

		if (existing) {
			return { success: false, error: 'Slug already exists' }
		}

		const { data, error } = await supabase
			.from('foundations')
			.insert({
				name: validated.name,
				description: validated.description,
				slug: validated.slug,
				founder_id: session.user.id,
				founded_year: validated.foundedYear,
				mission: validated.mission || null,
				vision: validated.vision || null,
				website_url: validated.websiteUrl || null,
				social_links: validated.socialLinks || {},
			})
			.select('slug')
			.single()

		if (error) {
			logger.error({
				eventType: 'FOUNDATION_CREATE_ERROR',
				error: error.message,
				userId: session.user.id,
			})
			return { success: false, error: error.message }
		}

		logger.info({
			eventType: 'FOUNDATION_CREATED',
			userId: session.user.id,
			slug: data.slug,
		})

		revalidatePath('/foundations')
		revalidatePath(`/foundations/${data.slug}`)

		return { success: true, slug: data.slug }
	} catch (error) {
		logger.error({
			eventType: 'FOUNDATION_CREATE_EXCEPTION',
			error: error instanceof Error ? error.message : 'Unknown error',
			userId: session.user.id,
		})
		return {
			success: false,
			error: 'An unexpected error occurred',
		}
	}
}
