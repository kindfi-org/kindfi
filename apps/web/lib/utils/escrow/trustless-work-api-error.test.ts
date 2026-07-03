import { describe, expect, test } from 'bun:test'
import { getTrustlessWorkApiErrorMessage } from './trustless-work-api-error'

describe('trustless-work-api-error', () => {
	test('reads axios-style response message', () => {
		const message = getTrustlessWorkApiErrorMessage(
			{
				response: {
					data: {
						message: 'One of the selected milestones to approve does not exist',
					},
				},
				message: 'Request failed with status code 400',
			},
			'fallback',
		)

		expect(message).toBe('One of the selected milestones to approve does not exist')
	})

	test('prefers explicit Error message over generic axios text', () => {
		const message = getTrustlessWorkApiErrorMessage(
			new Error('Escrow already initialized'),
			'fallback',
		)

		expect(message).toBe('Escrow already initialized')
	})
})
