'use client'

import {
	ArrowDownToLine,
	ArrowUpFromLine,
	CheckCircle2,
	Copy,
	ExternalLink,
	Loader2,
	Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import type { EtherfuseOnboardingStatus } from '~/lib/etherfuse/resolve-order-context'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'
import { ProfileSurfaceCard } from '../../profile-surface-card'
import { truncateWalletAddress } from './constants'

type RampMode = 'deposit' | 'withdraw'

interface RampsSidebarProps {
	mode: RampMode
	onModeChange: (mode: RampMode) => void
	walletAddress: string
	isOnboardingReady: boolean
	hasStartedOnboarding: boolean
	onboardingStatus: EtherfuseOnboardingStatus | null
	isStartingOnboarding: boolean
	onStartOnboarding: () => void
	onRefreshStatus: () => void
}

const PENDING_STEP_LABELS: Record<
	string,
	| 'profile.rampsPendingStepSecondaryVerification'
	| 'profile.rampsPendingStepIdentity'
	| 'profile.rampsPendingStepBanking'
	| 'profile.rampsPendingStepKycReview'
	| 'profile.rampsPendingStepWallet'
> = {
	secondary_verification: 'profile.rampsPendingStepSecondaryVerification',
	identity_and_agreements: 'profile.rampsPendingStepIdentity',
	banking: 'profile.rampsPendingStepBanking',
	kyc_review: 'profile.rampsPendingStepKycReview',
	wallet_verification: 'profile.rampsPendingStepWallet',
}

export function RampsSidebar({
	mode,
	onModeChange,
	walletAddress,
	isOnboardingReady,
	hasStartedOnboarding,
	onboardingStatus,
	isStartingOnboarding,
	onStartOnboarding,
	onRefreshStatus,
}: RampsSidebarProps) {
	const { t } = useI18n()
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(walletAddress)
			setCopied(true)
			toast.success(t('profile.addressCopied'))
			setTimeout(() => setCopied(false), 2000)
		} catch {
			toast.error(t('profile.addressCopyFailed'))
		}
	}

	const flowSteps =
		mode === 'deposit'
			? [
					t('profile.rampsFlowDepositStep1'),
					t('profile.rampsFlowDepositStep2'),
					t('profile.rampsFlowDepositStep3'),
				]
			: [
					t('profile.rampsFlowWithdrawStep1'),
					t('profile.rampsFlowWithdrawStep2'),
					t('profile.rampsFlowWithdrawStep3'),
				]

	return (
		<ProfileSurfaceCard className="flex h-full flex-col gap-6">
			<div className="space-y-3">
				<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
					{t('profile.rampsModeLabel')}
				</p>
				<div className="grid grid-cols-2 gap-2">
					<ModeButton
						active={mode === 'deposit'}
						onClick={() => onModeChange('deposit')}
						icon={ArrowDownToLine}
						label={t('profile.rampsTabDeposit')}
						description={t('profile.rampsModeDepositHint')}
					/>
					<ModeButton
						active={mode === 'withdraw'}
						onClick={() => onModeChange('withdraw')}
						icon={ArrowUpFromLine}
						label={t('profile.rampsTabWithdraw')}
						description={t('profile.rampsModeWithdrawHint')}
					/>
				</div>
			</div>

			<div className="space-y-3">
				<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
					{t('profile.rampsHowItWorks')}
				</p>
				<ol className="space-y-2.5">
					{flowSteps.map((step, index) => (
						<li key={step} className="flex items-start gap-3 text-sm text-slate-600">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
								{index + 1}
							</span>
							<span className="leading-relaxed">{step}</span>
						</li>
					))}
				</ol>
			</div>

			<div className="mt-auto space-y-3 border-t border-slate-100 pt-5">
				<div className="flex items-center justify-between gap-2">
					<p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
						{t('profile.externalWallet')}
					</p>
					{isOnboardingReady ? (
						<Badge
							variant="secondary"
							className="rounded-full bg-emerald-50 text-[10px] text-emerald-800"
						>
							{t('profile.rampsOnboardingVerified')}
						</Badge>
					) : hasStartedOnboarding ? (
						<Badge
							variant="secondary"
							className="rounded-full bg-amber-50 text-[10px] text-amber-900"
						>
							{t('profile.rampsOnboardingPending')}
						</Badge>
					) : null}
				</div>
				<div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2.5">
					<code className="truncate font-mono text-sm tracking-wide text-gray-900">
						{truncateWalletAddress(walletAddress)}
					</code>
					<Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 shrink-0 p-0">
						{copied ? (
							<CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
						) : (
							<Copy className="h-4 w-4" aria-hidden="true" />
						)}
						<span className="sr-only">{t('profile.copyAddress')}</span>
					</Button>
				</div>
				{!isOnboardingReady ? (
					<div className="space-y-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
						<p className="text-sm text-amber-950">
							{hasStartedOnboarding
								? t('profile.rampsOnboardingPendingDescription')
								: t('profile.rampsOnboardingRequired')}
						</p>
						{onboardingStatus?.hostUiMismatch ? (
							<p className="text-xs leading-relaxed text-amber-900/90">
								{t('profile.rampsHostUiMismatch')}
							</p>
						) : null}
						{onboardingStatus?.userMessage ? (
							<p className="text-xs text-amber-900/80">{onboardingStatus.userMessage}</p>
						) : null}
						{onboardingStatus?.needsSecondaryVerification ? (
							<p className="text-xs leading-relaxed text-amber-900/90">
								{t('profile.rampsSecondaryVerificationHint')}
							</p>
						) : null}
						{onboardingStatus?.pendingSteps?.length ? (
							<ul className="space-y-1 text-xs text-amber-950">
								{onboardingStatus.pendingSteps.map((step) => (
									<li key={step}>
										• {t(PENDING_STEP_LABELS[step] ?? 'profile.rampsPendingStepIdentity')}
									</li>
								))}
							</ul>
						) : null}
						{onboardingStatus && hasStartedOnboarding ? (
							<dl className="space-y-1 rounded-xl border border-amber-100/80 bg-white/60 px-3 py-2 text-[11px] text-amber-950">
								<div className="flex items-center justify-between gap-2">
									<dt>{t('profile.rampsStatusDetailKyc')}</dt>
									<dd className="font-mono uppercase">{onboardingStatus.kycStatus ?? '—'}</dd>
								</div>
								<div className="flex items-center justify-between gap-2">
									<dt>{t('profile.rampsStatusDetailWallet')}</dt>
									<dd className="font-mono uppercase">{onboardingStatus.walletKycStatus ?? '—'}</dd>
								</div>
								<div className="flex items-center justify-between gap-2">
									<dt>{t('profile.rampsStatusDetailBank')}</dt>
									<dd className="font-mono uppercase">
										{onboardingStatus.bankAccountCompliant
											? t('profile.rampsStatusDetailCompliant')
											: (onboardingStatus.bankAccountStatus ?? '—')}
									</dd>
								</div>
							</dl>
						) : null}
						<div className="flex flex-col gap-2">
							<Button
								onClick={onStartOnboarding}
								disabled={isStartingOnboarding}
								variant="outline"
								size="sm"
								className="w-full rounded-full border-amber-200 bg-white"
							>
								{isStartingOnboarding ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
										{t('profile.rampsOnboardingStarting')}
									</>
								) : (
									<>
										<ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
										{hasStartedOnboarding
											? t('profile.rampsContinueOnboarding')
											: t('profile.rampsStartOnboarding')}
									</>
								)}
							</Button>
							{hasStartedOnboarding ? (
								<Button
									onClick={onRefreshStatus}
									variant="ghost"
									size="sm"
									className="w-full rounded-full text-amber-950"
								>
									{t('profile.rampsRefreshStatus')}
								</Button>
							) : null}
						</div>
					</div>
				) : null}
				<p className="flex items-center gap-2 text-xs text-muted-foreground">
					<Sparkles className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
					{t('profile.rampsPoweredBy')}
				</p>
			</div>
		</ProfileSurfaceCard>
	)
}

function ModeButton({
	active,
	onClick,
	icon: Icon,
	label,
	description,
}: {
	active: boolean
	onClick: () => void
	icon: typeof ArrowDownToLine
	label: string
	description: string
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'rounded-2xl border p-3 text-left transition-all',
				active
					? 'border-emerald-200 bg-emerald-50/80 shadow-sm shadow-emerald-100/60'
					: 'border-slate-200/80 bg-white/60 hover:border-slate-300 hover:bg-white',
			)}
		>
			<div
				className={cn(
					'mb-2 flex h-9 w-9 items-center justify-center rounded-xl',
					active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
				)}
			>
				<Icon className="h-4 w-4" aria-hidden="true" />
			</div>
			<p className={cn('text-sm font-semibold', active ? 'text-emerald-900' : 'text-gray-900')}>
				{label}
			</p>
			<p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
		</button>
	)
}
