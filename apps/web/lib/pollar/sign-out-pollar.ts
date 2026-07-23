'use client'

import { clearPollarSession } from './clear-pollar-session'
import { resetPollarAuthBridgeState } from './reset-pollar-auth-bridge-state'

/** Sign out of Pollar when the user leaves KindFi. */
export const signOutPollar = async (): Promise<void> => {
	resetPollarAuthBridgeState()
	await clearPollarSession()
}
