import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { ReactElement } from 'react'
import { logger } from '@/lib/logger'
import { getResendClient } from './resend-client'

const appConfig = appEnvConfig('web')

export const appUrl = appConfig.deployment.appUrl

export async function getUserEmailAndName(userId: string): Promise<{
	email: string | null
	displayName: string | null
}> {
	const { data, error } = await supabaseServiceRole
		.from('profiles')
		.select('email, display_name')
		.eq('id', userId)
		.single()

	if (error || !data) {
		return { email: null, displayName: null }
	}
	return {
		email: data.email ?? null,
		displayName: data.display_name ?? null,
	}
}

export async function sendEmail({
	to,
	subject,
	react,
}: {
	to: string
	subject: string
	react: ReactElement
}): Promise<{ success: boolean; error?: string }> {
	try {
		const resend = getResendClient()
		const from = `${appConfig.resend.fromName} <${appConfig.resend.fromEmail}>`

		const { error } = await resend.emails.send({
			from,
			to,
			subject,
			react,
		})

		if (error) {
			logger.error('[EmailNotificationService] Resend error:', error)
			return { success: false, error: error.message }
		}
		return { success: true }
	} catch (err) {
		logger.error('[EmailNotificationService] Send failed:', err)
		return {
			success: false,
			error: err instanceof Error ? err.message : 'Unknown error',
		}
	}
}

export async function createInAppNotification({
	userId,
	title,
	body,
	type = 'info' as const,
}: {
	userId: string
	title: string
	body: string
	type?: 'info' | 'success' | 'warning' | 'error'
}) {
	try {
		const { error } = await supabaseServiceRole.from('notifications').insert({
			user_id: userId,
			title,
			body,
			type,
		})
		if (error) {
			logger.error('[EmailNotificationService] In-app notification failed:', error)
		}
	} catch (err) {
		logger.error('[EmailNotificationService] In-app notification error:', err)
	}
}

export async function getUserEmailPref(userId: string): Promise<boolean> {
	const prefs = await supabaseServiceRole
		.from('notification_preferences')
		.select('email')
		.eq('user_id', userId)
		.single()
	return prefs.data?.email !== false
}
