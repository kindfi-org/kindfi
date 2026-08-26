import { isSmartAccountEnabled } from '@packages/lib/smart-account'
import { NextResponse } from 'next/server'

/**
 * API route guard — returns 403 when Smart Account features are disabled.
 */
export const requireSmartAccountFeature = (): NextResponse | null => {
	if (!isSmartAccountEnabled()) {
		return NextResponse.json(
			{
				error: 'Smart Account features are disabled',
				code: 'SMART_ACCOUNT_DISABLED',
				hint: 'Smart Accounts are suspended for Mainnet. Use passkey auth + Stellar Wallet Kit (G-address) for production.',
			},
			{ status: 403 },
		)
	}
	return null
}
