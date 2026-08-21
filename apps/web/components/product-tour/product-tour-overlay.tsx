'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '~/components/base/button'
import useReducedMotion from '~/hooks/use-reduced-motion'
import { useI18n } from '~/lib/i18n'
import type { useProductTour } from '~/lib/product-tour/use-product-tour'

interface ProductTourOverlayProps {
	tour: ReturnType<typeof useProductTour>
	onFinish: () => void
	onSkip: () => void
}

interface Rect {
	top: number
	left: number
	width: number
	height: number
}

export function ProductTourOverlay({ tour, onFinish, onSkip }: ProductTourOverlayProps) {
	const { t } = useI18n()
	const reducedMotion = useReducedMotion()
	const { isActive, isReady, targetEl, currentStep, stepIndex, steps, isLastStep, goNext, goBack } =
		tour
	const [rect, setRect] = useState<Rect | null>(null)
	const tooltipRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isActive || !isReady) return
		if (!targetEl) {
			// Target never mounted (e.g. hidden on this viewport) — skip forward
			// instead of blocking the tour.
			if (isLastStep) {
				onFinish()
			} else {
				goNext()
			}
			return
		}

		const updateRect = () => {
			const bounds = targetEl.getBoundingClientRect()
			setRect({
				top: bounds.top + window.scrollY,
				left: bounds.left + window.scrollX,
				width: bounds.width,
				height: bounds.height,
			})
		}

		updateRect()
		window.addEventListener('resize', updateRect)
		window.addEventListener('scroll', updateRect, true)
		return () => {
			window.removeEventListener('resize', updateRect)
			window.removeEventListener('scroll', updateRect, true)
		}
	}, [isActive, isReady, targetEl, isLastStep, goNext, onFinish])

	useEffect(() => {
		if (!isActive) return
		tooltipRef.current?.focus()
	}, [isActive])

	useEffect(() => {
		if (!isActive) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault()
				onSkip()
			} else if (event.key === 'ArrowRight') {
				event.preventDefault()
				isLastStep ? onFinish() : goNext()
			} else if (event.key === 'ArrowLeft') {
				event.preventDefault()
				goBack()
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [isActive, isLastStep, goNext, goBack, onFinish, onSkip])

	if (!isActive || !currentStep || typeof document === 'undefined') {
		return null
	}

	const tooltipStyle = rect
		? {
				top: Math.max(rect.top - 12, 12),
				left: Math.min(Math.max(rect.left, 12), window.innerWidth - 340),
			}
		: { top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160 }

	return createPortal(
		<div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
			<button
				type="button"
				aria-label={t('onboarding.tour.skip')}
				onClick={onSkip}
				className={`absolute inset-0 bg-black/50 ${reducedMotion ? '' : 'transition-opacity'}`}
			/>

			{rect && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute rounded-lg ring-4 ring-white"
					style={{
						top: rect.top - 6,
						left: rect.left - 6,
						width: rect.width + 12,
						height: rect.height + 12,
					}}
				/>
			)}

			<div
				ref={tooltipRef}
				tabIndex={-1}
				className="absolute w-[min(320px,calc(100vw-24px))] rounded-lg border border-border bg-card p-4 shadow-xl focus:outline-none"
				style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
			>
				<p className="mb-1 text-xs text-muted-foreground">
					{t('onboarding.tour.stepLabel')
						.replace('{current}', String(stepIndex + 1))
						.replace('{total}', String(steps.length))}
				</p>
				<h2 className="mb-1 text-sm font-bold">{t(currentStep.titleKey)}</h2>
				<p className="mb-4 text-sm text-muted-foreground">{t(currentStep.bodyKey)}</p>

				<div className="flex items-center justify-between gap-2">
					<Button type="button" variant="ghost" size="sm" onClick={onSkip}>
						{t('onboarding.tour.skip')}
					</Button>
					<div className="flex gap-2">
						{stepIndex > 0 && (
							<Button type="button" variant="outline" size="sm" onClick={goBack}>
								{t('onboarding.tour.back')}
							</Button>
						)}
						<Button
							type="button"
							size="sm"
							className="gradient-btn text-white"
							onClick={isLastStep ? onFinish : goNext}
						>
							{isLastStep ? t('onboarding.tour.finish') : t('onboarding.tour.next')}
						</Button>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	)
}
