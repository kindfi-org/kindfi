'use client'

import { useStellarSorobanAccount } from '@packages/lib/hooks'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'
import type { Session, User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'
import { logger } from '@/lib/logger'

interface AuthContextType {
	isSupabaseUserLoading: boolean
	stellar: ReturnType<typeof useStellarSorobanAccount> | Record<string, unknown>
	user?: User
	supabaseUser?: SupabaseUser
}

const AuthContext = createContext<AuthContextType>({
	isSupabaseUserLoading: true,
	stellar: {},
})

/**
 * AuthProvider component that combines NextAuth SessionProvider with Supabase auth context
 * @param children - React child components to render
 * @param initSession - Initial session from server-side to prevent hydration mismatch
 */
export function AuthProvider({
	children,
	initSession,
}: {
	children: React.ReactNode
	initSession: Session | null
}) {
	const { data: session, status } = useSession()
	// Prefer authenticated client session; fall back to server session during load or after refresh
	const userSession = (
		status === 'authenticated' ? session : (session ?? initSession)
	) as Session | null
	const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | undefined>(undefined)
	const [isSupabaseUserLoading, setIsSupabaseUserLoading] = useState(true)
	const supabase = createSupabaseBrowserClient()
	// Pass the full session object to useStellarSorobanAccount so it can pass it to useStellarSignature
	// This avoids the SessionProvider requirement error in nested hooks
	// Pass the full session object so useStellarSignature can use it instead of calling useSession
	const stellarSorobanAccountState = useStellarSorobanAccount(userSession)

	// biome-ignore lint/correctness/useExhaustiveDependencies: any
	useEffect(() => {
		const syncSupabaseAuth = async () => {
			try {
				const accessToken = userSession?.supabaseAccessToken
				if (accessToken) {
					await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: accessToken,
					})
				}

				const {
					data: { session: supabaseSession },
				} = await supabase.auth.getSession()
				setSupabaseUser(supabaseSession?.user)
			} catch (error) {
				logger.error('Auth check failed:', error)
				setSupabaseUser(undefined)
			} finally {
				setIsSupabaseUserLoading(false)
			}
		}

		syncSupabaseAuth()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event: string, session: SupabaseSession | null) => {
			setSupabaseUser(session?.user)
			setIsSupabaseUserLoading(false)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [session, userSession?.supabaseAccessToken, supabase])

	// Always render children, but show loading state
	return (
		<AuthContext.Provider
			value={{
				user: userSession?.user,
				supabaseUser,
				isSupabaseUserLoading,
				stellar: stellarSorobanAccountState,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
