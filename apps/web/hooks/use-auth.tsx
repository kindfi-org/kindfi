'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
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
	const [user, setUser] = useState<User | null | undefined>(undefined)
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

	// Don't render until initial auth check is complete
	if (user === undefined) {
		return null
	}

	return (
		<AuthContext.Provider value={{ user, isLoading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
