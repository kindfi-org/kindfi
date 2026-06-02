'use client'

import { Fingerprint } from 'lucide-react'
import Link from 'next/link'
import { type ChangeEvent, useState } from 'react'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { FormAlert } from '~/components/shared/form/form-alert'
import { FormFieldGroup } from '~/components/shared/form/form-field-group'
import { FormShell } from '~/components/shared/form/form-shell'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'
import { useSmartAccountAuth } from '~/hooks/passkey/use-smart-account-auth'
import { useFormValidation } from '~/hooks/use-form-validation'
import { formLayoutClasses } from '~/lib/form/form-styles'
import { useI18n } from '~/lib/i18n'

export function LoginComponent() {
	const [email, setEmail] = useState('')
	const { t } = useI18n()

	const { isEmailInvalid, handleValidation, resetValidation } = useFormValidation({
		email: true,
	})

	const { isAuthenticating, authSuccess, authError, handleAuth, isNotRegistered, reset } =
		useSmartAccountAuth(email)

	const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleValidation(e as ChangeEvent<HTMLInputElement & { name: 'email' }>)
		const emailValue = e.target.value.trim()
		setEmail(emailValue)
		reset()
	}

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		e.stopPropagation()
		if (!isEmailInvalid) handleAuth()
		resetValidation()
	}

	return (
		<AuthLayout>
			<FormShell
				title={t('auth.welcomeBack')}
				subtitle={t('auth.signInSubtitle')}
				icon={Fingerprint}
				footer={
					<div className="w-full text-center text-sm text-muted-foreground">
						{t('auth.dontHaveAccount')}{' '}
						<Link className="font-medium text-primary hover:underline" href="/sign-up">
							{t('auth.createNewOne')}
						</Link>
					</div>
				}
			>
				<form className={formLayoutClasses.stack} aria-label="Sign in" onSubmit={onSubmit}>
					{isNotRegistered ? (
						<FormAlert variant="warning">
							{t('auth.deviceNotFound')}{' '}
							<Link className="font-medium text-primary hover:underline" href="/sign-up">
								{t('auth.signUp')}
							</Link>{' '}
							{t('auth.first')}.
						</FormAlert>
					) : null}

					{authError && !isNotRegistered ? (
						<FormAlert variant="error">{t('auth.authError')}</FormAlert>
					) : null}

					{authSuccess ? <FormAlert variant="success">{t('auth.authSuccess')}</FormAlert> : null}

					<FormFieldGroup
						id="email"
						label={t('auth.email')}
						error={isEmailInvalid ? t('auth.invalidEmail') : undefined}
						required
					>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder={t('auth.emailPlaceholder')}
							required
							aria-invalid={isEmailInvalid}
							onChange={onEmailChange}
							autoComplete="email"
						/>
					</FormFieldGroup>

					<Button
						size="lg"
						className="gradient-btn mt-2 w-full text-white"
						type="submit"
						aria-live="polite"
						aria-busy={isAuthenticating}
						disabled={!email || isAuthenticating || isEmailInvalid}
					>
						{isAuthenticating ? (
							t('auth.authenticating')
						) : (
							<>
								{t('auth.signInWithPasskey')} <Fingerprint className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
					<PasskeyInfoDialog />
				</form>
			</FormShell>
		</AuthLayout>
	)
}
