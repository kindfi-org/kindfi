'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase/client'
import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
	user: any | null
	loading: boolean
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	// Use undefined as initial state to prevent hydration mismatch
	const [user, setUser] = useState<User | null | undefined>(undefined)
	const [isLoading, setIsLoading] = useState(true)
	const supabase = createSupabaseBrowserClient()

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		try {
			const supabase = createClient()

			// If using mock client, simulate auth state
			if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
				setUser({ id: 'mock-user', email: 'mock@example.com' })
				setLoading(false)
				return
			}

			// Handle auth state changes
			const {
				data: { subscription },
			} = supabase.auth.onAuthStateChange((_event, session) => {
				setUser(session?.user ?? null)
				setLoading(false)
			})

			return () => {
				subscription.unsubscribe()
			}
		} catch (error) {
			console.warn('Auth provider error:', error)
			setUser(null)
			setLoading(false)
		}
	}, [])

	return (
		<AuthContext.Provider value={{ user, loading }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}
