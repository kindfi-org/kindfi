'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { StellarProvider } from '~/hooks/stellar/stellar-context'
import { AuthProvider } from '~/hooks/use-auth'
interface ProvidersProps {
	children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<StellarProvider>
				<AuthProvider>{children}</AuthProvider>
			</StellarProvider>
		</NextThemesProvider>
	)
}
