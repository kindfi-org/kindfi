'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { defaultProductTourAdapter } from './steps'
import type { ProductTourRole, ProductTourStep } from './types'

const MOUNT_WAIT_TIMEOUT_MS = 4000
const MOUNT_POLL_INTERVAL_MS = 100

function waitForElement(selector: string): Promise<HTMLElement | null> {
	return new Promise((resolve) => {
		const existing = document.querySelector<HTMLElement>(selector)
		if (existing) {
			resolve(existing)
			return
		}

		let elapsed = 0
		const interval = setInterval(() => {
			const el = document.querySelector<HTMLElement>(selector)
			elapsed += MOUNT_POLL_INTERVAL_MS
			if (el) {
				clearInterval(interval)
				resolve(el)
			} else if (elapsed >= MOUNT_WAIT_TIMEOUT_MS) {
				clearInterval(interval)
				resolve(null)
			}
		}, MOUNT_POLL_INTERVAL_MS)
	})
}

interface UseProductTourOptions {
	role: ProductTourRole
	enabled: boolean
}

export function useProductTour({ role, enabled }: UseProductTourOptions) {
	const steps = useMemo(() => defaultProductTourAdapter.getSteps(role), [role])
	const [isActive, setIsActive] = useState(false)
	const [stepIndex, setStepIndex] = useState(0)
	const [targetEl, setTargetEl] = useState<HTMLElement | null>(null)
	const [isReady, setIsReady] = useState(false)

	const currentStep: ProductTourStep | undefined = steps[stepIndex]

	useEffect(() => {
		if (!isActive || !currentStep) {
			setTargetEl(null)
			return
		}

		let cancelled = false
		setIsReady(false)
		void waitForElement(currentStep.targetSelector).then((el) => {
			if (cancelled) return
			// A missing target must never block the app — just skip to the next step.
			if (!el) {
				setIsReady(true)
				setTargetEl(null)
				return
			}
			setTargetEl(el)
			setIsReady(true)
		})

		return () => {
			cancelled = true
		}
	}, [isActive, currentStep])

	const start = useCallback(() => {
		if (!enabled || steps.length === 0) return
		setStepIndex(0)
		setIsActive(true)
	}, [enabled, steps.length])

	const stop = useCallback(() => {
		setIsActive(false)
		setTargetEl(null)
	}, [])

	const goNext = useCallback(() => {
		setStepIndex((prev) => {
			if (prev + 1 >= steps.length) {
				setIsActive(false)
				return prev
			}
			return prev + 1
		})
	}, [steps.length])

	const goBack = useCallback(() => {
		setStepIndex((prev) => Math.max(0, prev - 1))
	}, [])

	return {
		steps,
		currentStep,
		stepIndex,
		isActive,
		isReady,
		targetEl,
		start,
		stop,
		goNext,
		goBack,
		isLastStep: stepIndex === steps.length - 1,
	}
}
