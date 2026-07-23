'use client'

import { useStellarSorobanAccount } from '@packages/lib/hooks'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Session, User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

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
	const userSession = (
		status === 'authenticated' ? session : (session ?? initSession)
	) as Session | null
	const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | undefined>(undefined)
	const [isSupabaseUserLoading, setIsSupabaseUserLoading] = useState(true)

	const stellarSorobanAccountState = useStellarSorobanAccount(userSession)

	useEffect(() => {
		if (!userSession?.user?.id) {
			setSupabaseUser(undefined)
			setIsSupabaseUserLoading(false)
			return
		}

		// Custom NextAuth JWT is not a GoTrue session — use Authorization header on the client
		// instead of setSession (which calls /auth/v1/user and rejects non-GoTrue tokens).
		setSupabaseUser({
			id: userSession.user.id,
			email: userSession.user.email ?? undefined,
			app_metadata: {},
			user_metadata: {},
			aud: 'authenticated',
			created_at: '',
		} as SupabaseUser)
		setIsSupabaseUserLoading(false)
	}, [userSession?.user?.email, userSession?.user?.id])

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
