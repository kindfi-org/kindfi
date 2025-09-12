'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Session, User } from '@supabase/supabase-js'
import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { logger } from '~/lib'

interface AuthContextType {
	user: User | null
	isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Use null as initial state to prevent hydration mismatch
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const supabase = createSupabaseBrowserClient()

	// biome-ignore lint/correctness/useExhaustiveDependencies: any
	useEffect(() => {
		// Move session check to useEffect to avoid hydration mismatch
		const checkSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession()
				console.log('Session check result:', session)
				setUser(session?.user ?? null)
			} catch (error) {
				logger.error({
					eventType: 'Auth Check Failed',
					error: error instanceof Error ? error.message : 'Unknown error',
					details: error,
				})
				setUser(null)
			} finally {
				setIsLoading(false)
			}
		}

		checkSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(_event: string, session: Session | null) => {
				setUser(session?.user ?? null)
				setIsLoading(false)
			},
		)

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	// Always render children, but show loading state
	return (
		<SessionProvider>
			<AuthContext.Provider value={{ user, isLoading }}>
				{children}
			</AuthContext.Provider>
		</SessionProvider>
	)
}

export const useAuth = () => useContext(AuthContext)
