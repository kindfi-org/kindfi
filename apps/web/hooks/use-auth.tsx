'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Session, User } from '@supabase/supabase-js'
import { SessionProvider } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
	user: User | null
	isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Use undefined as initial state to prevent hydration mismatch
	const [user, setUser] = useState<User | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(true)
	const supabase = createSupabaseBrowserClient()

	// TODO: Check provider, it does not have a env variable context here hence, the check session might not be working properly...
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Move session check to useEffect to avoid hydration mismatch
		const checkSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession()
				console.log('Session check result:', session)
				setUser(session?.user ?? undefined)
			} catch (error) {
				console.error('Auth check failed:', error)
				setUser(undefined)
			} finally {
				setIsLoading(false)
			}
		}

		checkSession()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(
			(_event: string, session: Session | null) => {
				setUser(session?.user ?? undefined)
				setIsLoading(false)
			},
		)

		return () => {
			subscription.unsubscribe()
		}
	}, [])

	// Don't render until initial auth check is complete
	if (user === undefined) {
		return null
	}

	return (
		<SessionProvider>
			<AuthContext.Provider value={{ user, isLoading }}>
				{children}
			</AuthContext.Provider>
		</SessionProvider>
	)
}

export const useAuth = () => useContext(AuthContext)
