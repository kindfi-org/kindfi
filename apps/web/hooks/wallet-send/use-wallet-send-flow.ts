'use client'

import { useCallback, useMemo, useState } from 'react'
import { useWalletSendKit } from '~/hooks/wallet-send/use-wallet-send-kit'
import { getWalletTransferConfig } from '~/lib/config/wallet-transfer.config'
import { mapWalletSendError } from '~/lib/wallet-send/errors'
import type { ValidatedWalletSendPayment, WalletSendFormInput } from '~/lib/wallet-send/types'
import { validateWalletSendForm } from '~/lib/wallet-send/validation'

export type WalletSendFlowStep = 'form' | 'confirm' | 'signing' | 'result'

export type WalletSendFlowResult = {
	status: 'success' | 'error'
	hash?: string
	message: string
	code?: string
}

export const useWalletSendFlow = (sourceAddress: string | null) => {
	const [step, setStep] = useState<WalletSendFlowStep>('form')
	const [formInput, setFormInput] = useState<WalletSendFormInput>({
		asset: 'XLM',
		destination: '',
		amount: '',
		memo: { type: 'none' },
	})
	const [validatedPayment, setValidatedPayment] = useState<ValidatedWalletSendPayment | null>(null)
	const [result, setResult] = useState<WalletSendFlowResult | null>(null)
	const [formError, setFormError] = useState<string | null>(null)
	const { sendPayment, isSubmitting, isPollarReady } = useWalletSendKit()

	const configResult = useMemo(() => getWalletTransferConfig(), [])

	const reset = useCallback(() => {
		setStep('form')
		setValidatedPayment(null)
		setResult(null)
		setFormError(null)
	}, [])

	const goBack = useCallback(() => {
		setStep('form')
		setValidatedPayment(null)
		setFormError(null)
	}, [])

	const review = useCallback(() => {
		if (!sourceAddress || !configResult.ok) {
			setFormError(configResult.ok ? 'Connect your wallet to send assets.' : configResult.error)
			return
		}

		const validation = validateWalletSendForm(formInput, sourceAddress, configResult.config)
		if (!validation.ok) {
			setFormError(validation.error)
			return
		}

		setFormError(null)
		setValidatedPayment(validation.payment)
		setStep('confirm')
	}, [configResult, formInput, sourceAddress])

	const confirmSend = useCallback(async () => {
		if (!sourceAddress || !configResult.ok || !validatedPayment) {
			return
		}

		setStep('signing')
		setResult(null)

		try {
			const outcome = await sendPayment(sourceAddress, validatedPayment, configResult.config)
			setResult({
				status: 'success',
				hash: outcome.hash,
				message: 'Transfer submitted successfully.',
			})
			setStep('result')
		} catch (error) {
			const mapped = mapWalletSendError(error)
			setResult({
				status: 'error',
				message: mapped.message,
				code: mapped.code,
			})
			setStep('result')
		}
	}, [configResult, sendPayment, sourceAddress, validatedPayment])

	return {
		step,
		formInput,
		setFormInput,
		validatedPayment,
		formError,
		result,
		isSubmitting,
		isPollarReady,
		config: configResult.ok ? configResult.config : null,
		configError: configResult.ok ? null : configResult.error,
		review,
		confirmSend,
		reset,
		goBack,
	}
}
