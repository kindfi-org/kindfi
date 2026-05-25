'use client'

import { Mail, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ChangeEvent } from 'react'
import { useSetState } from 'react-use'
import { signUpAction } from '~/app/actions/auth'
import { Button } from '~/components/base/button'
import { CSRFTokenField } from '~/components/base/form'
import { Input } from '~/components/base/input'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { FormAlert } from '~/components/shared/form/form-alert'
import { FormFieldGroup } from '~/components/shared/form/form-field-group'
import { FormShell } from '~/components/shared/form/form-shell'
import { PasskeyInfoDialog } from '~/components/shared/passkey-info-dialog'
import { useFormValidation } from '~/hooks/use-form-validation'
import { useI18n } from '~/lib/i18n'
import { formLayoutClasses } from '~/lib/form/form-styles'
import { cn } from '~/lib/utils'

export function SignupComponent() {
	const router = useRouter()
	const { t } = useI18n()
	const [{ email, isSubmitting, error, success }, setSignUpState] = useSetState(
		{
			email: '',
			isSubmitting: false,
			error: '',
			success: '',
		},
	)

	const { isEmailInvalid, doesEmailExist, handleValidation, resetValidation } =
		useFormValidation({
			email: true,
		})

	const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
		handleValidation(e as ChangeEvent<HTMLInputElement & { name: 'email' }>)
		setSignUpState({ email: e.target.value })
		if (error) setSignUpState({ error: '' })
	}

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (isEmailInvalid || !email) return

		setSignUpState({ isSubmitting: true, error: '', success: '' })

		try {
			const formData = new FormData(e.currentTarget)
			const result = await signUpAction(formData)

			if (result.success) {
				setSignUpState({ success: result.message })
				setTimeout(() => {
					router.push(result?.redirect || '/sign-up')
				}, 1500)
			} else {
				setSignUpState({ error: result.message })
			}
		} catch (_err) {
			setSignUpState({
				error: 'An unexpected error occurred. Please try again.',
			})
		} finally {
			setSignUpState({ isSubmitting: false })
		}

		resetValidation()
	}

	const emailExistsError =
		email && !isEmailInvalid && doesEmailExist ? (
			<>
				{t('auth.accountExists')}{' '}
				<Link className="font-medium text-primary hover:underline" href="/sign-in">
					{t('auth.signIn')}
				</Link>{' '}
				{t('auth.instead')}.
			</>
		) : undefined

	return (
		<AuthLayout>
			<FormShell
				title={t('auth.createAccount')}
				subtitle={t('auth.signUpSubtitle')}
				icon={UserPlus}
				footer={
					<div className="w-full text-center text-sm text-muted-foreground">
						{t('auth.alreadyHaveAccount')}{' '}
						<Link
							href="/sign-in"
							className="font-medium text-primary hover:underline"
						>
							{t('nav.signIn')}
						</Link>
					</div>
				}
			>
				<form className={formLayoutClasses.stack} aria-label="Sign up" onSubmit={onSubmit}>
					<CSRFTokenField />

					{success ? <FormAlert variant="success">{success}</FormAlert> : null}
					{error ? <FormAlert variant="error">{error}</FormAlert> : null}

					<FormFieldGroup
						id="email"
						label={t('auth.email')}
						error={
							isEmailInvalid
								? t('auth.invalidEmail')
								: emailExistsError
						}
						required
					>
						<div className="relative">
							<Mail
								className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
								aria-hidden="true"
							/>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder={t('auth.emailPlaceholder')}
								required
								aria-invalid={isEmailInvalid || Boolean(emailExistsError)}
								onChange={onEmailChange}
								value={email}
								autoComplete="email"
								className={cn('pl-10')}
							/>
						</div>
					</FormFieldGroup>

					<Button
						className="gradient-btn w-full text-white"
						type="submit"
						disabled={isSubmitting || isEmailInvalid || !email || Boolean(emailExistsError)}
						aria-live="polite"
						aria-busy={isSubmitting}
					>
						{isSubmitting ? (
							t('auth.creatingAccount')
						) : (
							<>
								{t('auth.createAccountBtn')}{' '}
								<UserPlus className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>

					<PasskeyInfoDialog />
				</form>
			</FormShell>
		</AuthLayout>
	)
}
