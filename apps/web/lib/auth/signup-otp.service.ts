import { appEnvConfig } from '@packages/lib/config'
import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { AppEnvInterface } from '@packages/lib/types'
import type { AuthError } from '@supabase/supabase-js'
import { getResendClient } from '~/lib/email/resend-client'
import { SignupVerificationEmail } from '~/lib/email/templates/signup-verification-email'
import { Logger } from '~/lib/logger'

const logger = new Logger()

type GenerateLinkResult = Awaited<ReturnType<typeof supabaseServiceRole.auth.admin.generateLink>>

function isExistingAuthUserError(error: AuthError | null): boolean {
	if (!error?.message) return false
	const message = error.message.toLowerCase()
	return (
		message.includes('already registered') ||
		message.includes('already exists') ||
		message.includes('user already') ||
		message.includes('email address has already been registered')
	)
}

async function generateSignupOtpLink(
	email: string,
	redirectTo: string,
): Promise<NonNullable<GenerateLinkResult['data']>> {
	const inviteResult = await supabaseServiceRole.auth.admin.generateLink({
		type: 'invite',
		email,
		options: { redirectTo },
	})

	if (!inviteResult.error && inviteResult.data) {
		return inviteResult.data
	}

	if (inviteResult.error && !isExistingAuthUserError(inviteResult.error)) {
		throw inviteResult.error
	}

	const magicLinkResult = await supabaseServiceRole.auth.admin.generateLink({
		type: 'magiclink',
		email,
		options: { redirectTo },
	})

	if (magicLinkResult.error || !magicLinkResult.data) {
		throw magicLinkResult.error ?? new Error('Failed to generate verification code')
	}

	return magicLinkResult.data
}

async function sendSignupOtpEmail(
	email: string,
	otp: string,
	appConfig: AppEnvInterface,
): Promise<void> {
	const resend = getResendClient()
	const from = `${appConfig.resend.fromName} <${appConfig.resend.fromEmail}>`

	const { error } = await resend.emails.send({
		from,
		to: email,
		subject: 'Your verification code',
		react: SignupVerificationEmail({ otp }),
	})

	if (error) {
		logger.error({
			eventType: 'SIGN_UP_OTP_EMAIL_FAILED',
			email,
			error: error.message,
		})
		throw new Error('Failed to send verification email. Please try again.')
	}
}

export async function sendSignupVerificationOtp(
	email: string,
	redirectTo: string,
): Promise<{ success: true }> {
	const appConfig = appEnvConfig('web')

	if (!appConfig.resend.apiKey) {
		throw new Error('Email service is not configured. Please contact support.')
	}

	const linkData = await generateSignupOtpLink(email, redirectTo)
	const otp = linkData.properties?.email_otp

	if (!otp) {
		logger.error({
			eventType: 'SIGN_UP_OTP_MISSING',
			email,
		})
		throw new Error('Failed to generate verification code. Please try again.')
	}

	await sendSignupOtpEmail(email, otp, appConfig)

	logger.info({
		eventType: 'SIGN_UP_OTP_SENT',
		email,
	})

	return { success: true }
}
