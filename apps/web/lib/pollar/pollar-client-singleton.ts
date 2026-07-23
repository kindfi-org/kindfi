'use client'

import { PollarClient } from '@pollar/core'
import { getPollarClientConfig, isPollarConfigured } from './config'

/**
 * One browser client per tab for this Pollar app key.
 * Pollar rotates refresh tokens single-use — multiple PollarClient instances
 * against the same storage will trip reuse detection and 401 on /auth/refresh.
 */
let pollarClient: PollarClient | null = null

export const getKindfiPollarClient = (): PollarClient | null => {
	if (typeof window === 'undefined' || !isPollarConfigured()) {
		return null
	}

	if (!pollarClient) {
		pollarClient = new PollarClient({
			...getPollarClientConfig(),
			deviceLabel: 'kindfi-web',
		})
	}

	return pollarClient
}
