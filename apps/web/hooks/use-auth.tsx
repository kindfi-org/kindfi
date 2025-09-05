'use client'

import { useStellarSorobanAccount } from '@packages/lib/hooks'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Session, User } from '@supabase/supabase-js'
import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
	user: User | null
	isLoading: boolean
	stellar: ReturnType<typeof useStellarSorobanAccount> | Record<string, unknown>
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	stellar: {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Use null as initial state to prevent hydration mismatch
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const supabase = createSupabaseBrowserClient()
	const stellarSorobanAccountState = useStellarSorobanAccount()

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
				console.error('Auth check failed:', error)
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
			<AuthContext.Provider
				value={{
					user,
					isLoading,
					stellar: stellarSorobanAccountState,
				}}
			>
				{children}
			</AuthContext.Provider>
		</SessionProvider>
	)
}

export const useAuth = () => useContext(AuthContext)
