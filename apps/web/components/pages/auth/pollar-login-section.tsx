'use client'

import { isPollarOnboardingEnabled } from '@packages/lib/pollar'
import { Fingerprint, Loader2, MoreHorizontal, Shield, Wallet } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { usePollarAuthBridge } from '~/hooks/pollar/use-pollar-auth-bridge'
import { useI18n } from '~/lib/i18n'
import { usePollarProviderReady } from '~/lib/pollar/provider'
import { useIsClient } from '~/lib/pollar/use-is-client'
import { cn } from '~/lib/utils'

const POLLAR_LOGO_URL = 'https://pollar.xyz/assets/logo_pollar.png'

interface PollarLoginSectionProps {
	variant?: 'sign-up' | 'sign-in'
	legacyHref: string
}

export const PollarLoginSection = ({
	variant = 'sign-up',
	legacyHref,
}: PollarLoginSectionProps) => {
	const isClient = useIsClient()
	const pollarReady = usePollarProviderReady()

	if (!isPollarOnboardingEnabled()) {
		return null
	}

	if (!isClient || !pollarReady) {
		return <PollarLoginSectionShell variant={variant} legacyHref={legacyHref} isLoading />
	}

	return <PollarLoginSectionConnected variant={variant} legacyHref={legacyHref} />
}

const PollarLoginSectionConnected = ({
	variant = 'sign-up',
	legacyHref,
}: PollarLoginSectionProps) => {
	const { t } = useI18n()
	const { isBridging, loginWithPollar, configStatus } = usePollarAuthBridge()

	return (
		<PollarLoginSectionShell
			variant={variant}
			legacyHref={legacyHref}
			isLoading={configStatus === 'loading'}
			isBridging={isBridging}
			isConfigError={configStatus === 'error'}
			onGoogle={() => void loginWithPollar('google')}
			onMoreOptions={() => void loginWithPollar('email')}
			t={t}
		/>
	)
}

interface PollarLoginSectionShellProps {
	variant: 'sign-up' | 'sign-in'
	legacyHref: string
	isLoading?: boolean
	isBridging?: boolean
	isConfigError?: boolean
	onGoogle?: () => void
	onMoreOptions?: () => void
	t?: ReturnType<typeof useI18n>['t']
}

const GoogleIcon = ({ className }: { className?: string }) => (
	<svg className={className} viewBox="0 0 24 24" aria-hidden="true">
		<path
			fill="#4285F4"
			d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
		/>
		<path
			fill="#34A853"
			d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
		/>
		<path
			fill="#FBBC05"
			d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
		/>
		<path
			fill="#EA4335"
			d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
		/>
	</svg>
)

const PollarLoginSectionShell = ({
	variant,
	legacyHref,
	isLoading = false,
	isBridging = false,
	isConfigError = false,
	onGoogle,
	onMoreOptions,
	t,
}: PollarLoginSectionShellProps) => {
	const { t: fallbackT } = useI18n()
	const translate = t ?? fallbackT
	const busy = isLoading || isBridging
	const disabled = busy || isConfigError || !onGoogle

	return (
		<div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-50 via-white to-white shadow-sm ring-1 ring-slate-900/3">
			<div className="border-b border-slate-100 bg-white/70 px-5 pb-4 pt-5">
				<div className="flex items-start gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm">
						<Image
							src={POLLAR_LOGO_URL}
							alt=""
							width={28}
							height={28}
							className="h-7 w-7 object-contain"
							unoptimized
						/>
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<div className="flex flex-wrap items-center gap-2">
							<p className="text-base font-semibold tracking-tight text-slate-900">
								{variant === 'sign-up'
									? translate('auth.pollarSignUpTitle')
									: translate('auth.pollarSignInTitle')}
							</p>
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
								<Wallet className="h-3 w-3" aria-hidden="true" />
								{translate('auth.pollarWalletReady')}
							</span>
						</div>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{translate('auth.pollarSubtitle')}
						</p>
					</div>
				</div>
			</div>

			<div className="space-y-4 px-5 py-5">
				{isConfigError ? (
					<p className="rounded-xl border border-destructive/25 bg-destructive/5 px-3.5 py-2.5 text-center text-xs leading-relaxed text-destructive">
						Pollar could not load its configuration. Check your publishable key and network, then
						refresh.
					</p>
				) : null}

				<div className="grid gap-2.5">
					<Button
						type="button"
						variant="outline"
						className={cn(
							'h-11 w-full justify-center gap-2.5 rounded-xl border-slate-200 bg-white text-sm font-medium shadow-sm',
							'transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow',
						)}
						disabled={disabled}
						onClick={onGoogle}
					>
						{busy ? (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						) : (
							<GoogleIcon className="h-4 w-4 shrink-0" />
						)}
						{translate('auth.continueWithGoogle')}
					</Button>

					<Button
						type="button"
						variant="outline"
						className={cn(
							'h-11 w-full justify-center gap-2.5 rounded-xl border-slate-200 bg-slate-50/80 text-sm font-medium',
							'transition-all hover:border-slate-300 hover:bg-slate-100',
						)}
						disabled={disabled}
						onClick={onMoreOptions}
					>
						{busy ? (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						) : (
							<MoreHorizontal className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
						)}
						{translate('auth.pollarMoreOptions')}
					</Button>
				</div>

				<div className="flex gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3.5 py-3">
					<Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
					<p className="text-xs leading-relaxed text-muted-foreground">
						{translate('auth.pollarCustodyNotice')}
					</p>
				</div>
			</div>

			<div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4">
				<div className="relative mb-3">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-slate-200" />
					</div>
					<div className="relative flex justify-center">
						<span className="bg-slate-50/40 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
							{translate('auth.orContinueWith')}
						</span>
					</div>
				</div>

				<Button
					asChild
					variant="ghost"
					className="h-10 w-full rounded-xl text-sm font-medium text-slate-700 hover:bg-white hover:text-slate-900"
				>
					<Link href={legacyHref} className="inline-flex items-center justify-center gap-2">
						<Fingerprint className="h-4 w-4 text-emerald-700" aria-hidden="true" />
						{translate('auth.usePasskeyInstead')}
					</Link>
				</Button>
			</div>
		</div>
	)
}
