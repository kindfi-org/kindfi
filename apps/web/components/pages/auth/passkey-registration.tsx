'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { CheckCircle2, Mail, Shield, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSession, signIn } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/lib/logger'
import { createSessionAction } from '~/app/actions/auth'
import { Button } from '~/components/base/button'
import { FormAlert } from '~/components/shared/form/form-alert'
import { FormShell } from '~/components/shared/form/form-shell'
import { AuthLayout } from '~/components/shared/layout/auth/auth-layout'
import { PasskeyCompatDialog } from '~/components/shared/passkey-compat-dialog'
import { PasskeySetupTips } from '~/components/shared/passkey-setup-tips'
import { useSmartAccountRegistration } from '~/hooks/passkey/use-smart-account-registration'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'
import { formLayoutClasses } from '~/lib/form/form-styles'
import { useI18n } from '~/lib/i18n'

export function PasskeyRegistrationComponent() {
	const router = useRouter()
	const { t } = useI18n()
	const [userEmail, setUserEmail] = useState('')
	const [userId, setUserId] = useState('')
	const [isLoadingUser, setIsLoadingUser] = useState(true)
	const [isFinalizing, setIsFinalizing] = useState(false)
	const isWebAuthnSupported = useWebAuthnSupport()

	const {
		isCreatingPasskey,
		regSuccess,
		regError,
		isAlreadyRegistered,
		smartAccountAddress,
		credentialId,
		publicKey,
		handleRegister,
		reset,
	} = useSmartAccountRegistration(userEmail, userId)

	useEffect(() => {
		const supabase = createSupabaseBrowserClient()
		supabase.auth
			.getUser()
			.then(({ data }) => {
				if (data.user?.email) {
					setUserEmail(data.user.email)
					setUserId(data.user.id || '')
				} else {
					router.replace('/sign-up')
				}
			})
			.finally(() => {
				setIsLoadingUser(false)
			})
	}, [router])

	const handleFinalize = useCallback(async () => {
		if (!regSuccess || !userEmail || !userId || !credentialId || !publicKey || isFinalizing) return

		setIsFinalizing(true)

		try {
			const supabase = createSupabaseBrowserClient()
			await supabase
				.from('profiles')
				.update({
					display_name: userEmail.split('@')[0],
				})
				.eq('next_auth_user_id', userId)

			const sessionResult = await createSessionAction({
				userId,
				email: userEmail,
			})

			if (!sessionResult.success) {
				throw new Error(sessionResult.message)
			}

			const loginResult = await signIn('credentials', {
				redirect: false,
				userId,
				email: userEmail,
				credentialId,
				pubKey: publicKey,
				address: smartAccountAddress || '0x',
			})

			if (!loginResult?.ok) {
				throw new Error('Failed to create authentication session')
			}

			await getSession()
			sessionStorage.setItem('kindfi_new_session', 'true')
			await router.refresh()
			router.push('/profile')
		} catch (e) {
			logger.error('Finalize passkey registration error', e)
			setIsFinalizing(false)
			router.push('/sign-in')
		}
	}, [
		regSuccess,
		userEmail,
		userId,
		credentialId,
		publicKey,
		smartAccountAddress,
		router,
		isFinalizing,
	])

	useEffect(() => {
		if (!regSuccess || !userEmail || !userId || !credentialId || !publicKey) {
			return
		}

		void handleFinalize()
	}, [regSuccess, userEmail, userId, credentialId, publicKey, handleFinalize])

	const shellFooter = (
		<div className="w-full text-center text-sm text-muted-foreground">
			{t('auth.passkeyNeedHelp')}{' '}
			<Link href="/support" className="font-medium text-primary hover:underline">
				{t('auth.passkeyContactSupport')}
			</Link>
		</div>
	)

	if (isLoadingUser) {
		return (
			<AuthLayout contentMaxWidth="lg">
				<FormShell
					className="w-full max-w-none"
					maxWidth="lg"
					title={t('auth.passkeyTitle')}
					subtitle={t('auth.passkeySubtitle')}
					icon={Shield}
				>
					<div className="space-y-4 py-2" aria-busy="true" aria-live="polite">
						<div className="h-14 animate-pulse rounded-xl bg-slate-100" />
						<div className="h-24 animate-pulse rounded-xl bg-slate-100" />
						<div className="h-11 animate-pulse rounded-xl bg-slate-100" />
					</div>
				</FormShell>
			</AuthLayout>
		)
	}

	if (!isWebAuthnSupported) {
		return (
			<AuthLayout>
				<FormShell
					title={t('auth.passkeyWebAuthnUnsupportedTitle')}
					subtitle={t('auth.passkeyWebAuthnUnsupportedDesc')}
					icon={Shield}
				>
					<Button
						onClick={() => router.push('/')}
						className="gradient-btn w-full text-white"
						type="button"
					>
						{t('auth.passkeyReturnHome')}
					</Button>
				</FormShell>
			</AuthLayout>
		)
	}

	if (regSuccess) {
		return (
			<AuthLayout contentMaxWidth="lg" aside={<PasskeySetupTips variant="panel" />}>
				<FormShell
					className="w-full max-w-none"
					maxWidth="lg"
					title={t('auth.passkeySuccessTitle')}
					subtitle={t('auth.passkeySuccessSubtitle')}
					icon={Shield}
				>
					<div className="flex flex-col items-center justify-center space-y-4 py-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
							<CheckCircle2 className="h-8 w-8 text-primary" aria-hidden="true" />
						</div>
						{isFinalizing ? (
							<p className="text-center text-sm text-muted-foreground" aria-live="polite">
								{t('auth.passkeyFinalizing')}
							</p>
						) : (
							<div className="flex w-full flex-col gap-2 sm:flex-row">
								<Button
									onClick={() => void handleFinalize()}
									className="gradient-btn flex-1 text-white"
									type="button"
								>
									{t('auth.passkeyContinueProfile')}
								</Button>
								<Button
									variant="outline"
									onClick={() => router.push('/sign-in')}
									className="flex-1"
									type="button"
								>
									{t('auth.passkeyGoToLogin')}
								</Button>
							</div>
						)}
					</div>
				</FormShell>
			</AuthLayout>
		)
	}

	return (
		<AuthLayout contentMaxWidth="lg" aside={<PasskeySetupTips variant="panel" />}>
			<FormShell
				className="w-full max-w-none"
				maxWidth="lg"
				title={t('auth.passkeyTitle')}
				subtitle={t('auth.passkeySubtitle')}
				icon={Shield}
				footer={shellFooter}
			>
				<div className={formLayoutClasses.stack}>
					{userEmail ? (
						<div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-[#fafbfc] px-4 py-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
								<Mail className="h-4 w-4" aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									{t('auth.email')}
								</p>
								<p className="truncate text-sm font-semibold text-slate-900" translate="no">
									{userEmail}
								</p>
							</div>
						</div>
					) : null}

					<div className="rounded-xl border border-slate-200/80 bg-[#fafbfc] px-4 py-4">
						<p className="text-sm font-medium text-slate-900">{t('auth.passkeyWhatIs')}</p>
						<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
							{t('auth.passkeyWhatIsBody')}
						</p>
					</div>

					<Button
						className="gradient-btn w-full text-white"
						onClick={handleRegister}
						disabled={isCreatingPasskey || !userEmail}
						type="button"
						aria-busy={isCreatingPasskey}
					>
						{isCreatingPasskey ? (
							t('auth.passkeyCreating')
						) : (
							<>
								{t('auth.passkeyRegisterBtn')}{' '}
								<UserPlus className="ml-2 h-4 w-4" aria-hidden="true" />
							</>
						)}
					</Button>

					<PasskeyCompatDialog />

					{regError && !isAlreadyRegistered ? (
						<FormAlert variant="error">
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<span>{regError}</span>
								<Button
									variant="link"
									type="button"
									onClick={reset}
									className="h-auto p-0 font-medium"
								>
									{t('auth.passkeyTryAgain')}
								</Button>
							</div>
						</FormAlert>
					) : null}

					{isAlreadyRegistered ? (
						<FormAlert variant="warning">
							<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
								<span>{t('auth.passkeyAlreadyRegistered')}</span>
								<Button
									variant="link"
									type="button"
									onClick={() => router.push('/profile?passkey=registered')}
									className="h-auto p-0 font-medium"
								>
									{t('auth.passkeyContinue')}
								</Button>
							</div>
						</FormAlert>
					) : null}

					<div className="lg:hidden">
						<PasskeySetupTips variant="inline" />
					</div>
				</div>
			</FormShell>
		</AuthLayout>
	)
}
