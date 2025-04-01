'use client'

import type { Session, User } from 'next-auth'
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react'
import { createContext, useContext, useState } from 'react'
import { usePasskeyAuthentication } from '~/hooks/passkey/use-passkey-authentication'
import { usePasskeyRegistration } from '~/hooks/passkey/use-passkey-registration'
import { useWebAuthnSupport } from '~/hooks/passkey/use-web-authn-support'

interface AuthContextType {
	user: User | null
	isLoading: boolean
	signInWithPasskey: (email: string) => Promise<void>
	registerPasskey: (email: string, displayName?: string) => Promise<void>
	recoverWithOTP: (email: string) => Promise<void>
	logout: () => Promise<void>
	isPasskeySupported: boolean
}

const AuthContext = createContext<AuthContextType>({
	user: null,
	isLoading: true,
	signInWithPasskey: async () => {},
	registerPasskey: async () => {},
	recoverWithOTP: async () => {},
	logout: async () => {},
	isPasskeySupported: false,
})

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
	// Provider for NextAuth
	return (
		<SessionProvider>
			<AuthProviderContent>{children}</AuthProviderContent>
		</SessionProvider>
	)
}

function AuthProviderContent({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession()
	const isLoading = status === 'loading'
	const user = session?.user || null
	const [email, setEmail] = useState<string>('')

	const isPasskeySupported = useWebAuthnSupport()

	const { handleAuth, isAuthenticating } = usePasskeyAuthentication(email, {
		onSign: undefined,
		prepareSign: undefined,
	})
	const { handleRegister, isCreatingPasskey } = usePasskeyRegistration(
		email,
		{},
	)

	const signInWithPasskey = async (userEmail: string) => {
		setEmail(userEmail)
		try {
			// First use the existing passkey authentication to verify
			await handleAuth()

			// Then complete the authentication with NextAuth/Supabase via the passkey provider
			await signIn('passkey', {
				email: userEmail,
				redirect: true,
				callbackUrl: '/',
			})
		} catch (error) {
			console.error('Error signing in with passkey:', error)
		}
	}

	const registerPasskey = async (userEmail: string, displayName?: string) => {
		setEmail(userEmail)
		try {
			// This will register in Redis using the existing implementation
			await handleRegister()

			// Optionally update Supabase to mark the user as passkey-enabled
			await fetch('/api/auth/enable-passkey', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: userEmail,
				}),
			})
		} catch (error) {
			console.error('Error registering passkey:', error)
		}
	}

	const recoverWithOTP = async (userEmail: string) => {
		try {
			// Call the OTP provider for recovery
			await signIn('otp-recovery', {
				email: userEmail,
				redirect: true,
				callbackUrl: '/account/setup-passkey',
			})
		} catch (error) {
			console.error('Error recovering with OTP:', error)
		}
	}

	const logout = async () => {
		await signOut({ redirect: true, callbackUrl: '/sign-in' })
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isLoading,
				signInWithPasskey,
				registerPasskey,
				recoverWithOTP,
				logout,
				isPasskeySupported,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useNextAuth = () => useContext(AuthContext)
