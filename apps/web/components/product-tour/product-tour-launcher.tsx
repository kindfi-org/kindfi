'use client'

import { useEffect, useState } from 'react'
import { completeProductTourAction } from '~/app/actions/onboarding/complete-product-tour'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import type { ProductTourRole } from '~/lib/product-tour/types'
import { useProductTour } from '~/lib/product-tour/use-product-tour'
import { ProductTourOverlay } from './product-tour-overlay'

interface ProductTourLauncherProps {
	role: ProductTourRole | null
	productTourCompletedAt: string | null
	/** Renders only the "replay" trigger, e.g. for a Settings/Help section. */
	replayOnly?: boolean
}

export function ProductTourLauncher({
	role,
	productTourCompletedAt,
	replayOnly = false,
}: ProductTourLauncherProps) {
	const { t } = useI18n()
	const [hasPersistedCompletion, setHasPersistedCompletion] = useState(
		Boolean(productTourCompletedAt),
	)
	const tour = useProductTour({ role: role ?? 'donor', enabled: Boolean(role) })
	const [showPrompt, setShowPrompt] = useState(
		!replayOnly && !productTourCompletedAt && Boolean(role),
	)

	useEffect(() => {
		setShowPrompt(!replayOnly && !hasPersistedCompletion && Boolean(role))
	}, [replayOnly, hasPersistedCompletion, role])

	const persistCompletion = async () => {
		setHasPersistedCompletion(true)
		try {
			await completeProductTourAction()
		} catch {
			// Tour completion is best-effort; failing to persist must not block app use.
		}
	}

	const handleFinish = async () => {
		tour.stop()
		setShowPrompt(false)
		await persistCompletion()
	}

	const handleSkip = async () => {
		tour.stop()
		setShowPrompt(false)
		await persistCompletion()
	}

	if (!role) return null

	return (
		<>
			{showPrompt && (
				<div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
					<span>{t('onboarding.tour.start')}</span>
					<div className="flex gap-2">
						<Button type="button" size="sm" variant="ghost" onClick={handleSkip}>
							{t('onboarding.tour.skip')}
						</Button>
						<Button
							type="button"
							size="sm"
							className="gradient-btn text-white"
							onClick={() => {
								setShowPrompt(false)
								tour.start()
							}}
						>
							{t('onboarding.tour.start')}
						</Button>
					</div>
				</div>
			)}

			{replayOnly && (
				<Button type="button" variant="outline" size="sm" onClick={() => tour.start()}>
					{t('onboarding.tour.replay')}
				</Button>
			)}

			<ProductTourOverlay tour={tour} onFinish={handleFinish} onSkip={handleSkip} />
		</>
	)
}
