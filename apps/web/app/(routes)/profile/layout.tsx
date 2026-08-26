import type { ReactNode } from 'react'
import { Web3Providers } from '~/components/shared/layout/web3-providers'

export default function ProfileLayout({ children }: { children: ReactNode }) {
	return <Web3Providers>{children}</Web3Providers>
}
