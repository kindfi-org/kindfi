'use client'

import {
	ExternalLink,
	LogOut,
	Menu,
	Settings,
	User as UserIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from 'next-auth'
import { useState } from 'react'
import { toast } from 'sonner'
import { signOutAction } from '~/app/actions/auth'
import { Avatar, AvatarFallback } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { LogoOrg } from '~/components/base/logo-org'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '~/components/base/sheet'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useAuth } from '~/hooks/use-auth'
import { useI18n } from '~/lib/i18n/context'
import { getAvatarFallback } from '~/lib/utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'
import { LanguageSelector } from './language-selector'
import { Navigation } from './navigation'

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const { user } = useAuth()
	const { t } = useI18n()
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container max-w-screen-xl mx-auto">
				<div className="flex h-16 items-center justify-between px-4">
					{/* Logo */}
					<Link href="/" className="flex items-center space-x-2">
						<LogoOrg width={120} height={33} className="h-auto w-auto" />
					</Link>

					{/* Navigation - Hidden on mobile */}
					<div className="hidden md:block">
						<Navigation />
					</div>

					{/* Action Buttons */}
					<div className="flex items-center space-x-4">
						<LanguageSelector />
						{user ? <UserMenu user={user} /> : <AuthButtons />}

						{/* Mobile menu */}
						<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									aria-label={t('aria.openMobileMenu')}
									aria-expanded={mobileMenuOpen}
									className="md:hidden"
								>
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-80">
								<SheetHeader>
									<SheetTitle>{t('nav.menu')}</SheetTitle>
								</SheetHeader>
								<div className="mt-8 flex flex-col gap-4">
									<div className="pb-4 border-b">
										<LanguageSelector />
									</div>
									<MobileNavigation />
									{user ? (
										<MobileUserMenu user={user} />
									) : (
										<MobileAuthButtons />
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</header>
	)
}

const WalletCopyButton = ({
	address,
	className,
}: {
	address: string
	className?: string
}) => {
	const explorerUrl = getStellarExplorerUrl(address)

	const start = address.substring(0, 6)
	const end = address.substring(address.length - 6)

	return (
		<Button
			asChild
			variant="outline"
			className={['flex w-full justify-between', className]
				.filter(Boolean)
				.join(' ')}
		>
			<a
				href={explorerUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="flex w-full items-center justify-between"
			>
				<span className="text-sm font-medium text-muted-foreground">
					{start}
					{'...'}
					{end}
				</span>
				<ExternalLink className="size-4 text-muted-foreground" />
			</a>
		</Button>
	)
}

const UserMenu = ({ user }: { user: User }) => {
	const router = useRouter()
	const { t } = useI18n()
	const { disconnect } = useWallet()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const handleSignOutAction = async () => {
		if (isSigningOut) return

		try {
			setIsSigningOut(true)

			// Disconnect wallet/passkey first
			try {
				disconnect()
			} catch (error) {
				console.error('Error disconnecting wallet:', error)
				// Continue with sign out even if wallet disconnect fails
			}

			// Then sign out from Supabase
			// Note: signOutAction may throw a NEXT_REDIRECT error, which is expected
			// and should be allowed to propagate so Next.js can handle the redirect
			await signOutAction()
		} catch (error) {
			// Check if this is a Next.js redirect error (which is expected)
			// @ts-expect-error - NEXT_REDIRECT is a special Next.js error type
			if (
				error &&
				typeof error === 'object' &&
				'digest' in error &&
				error.digest?.startsWith('NEXT_REDIRECT')
			) {
				// This is a redirect, let it propagate
				throw error
			}

			// Handle actual errors
			console.error('Error signing out:', error)
			toast.error(t('auth.signOutError') || 'Error signing out')
			// Redirect to home even on error
			router.push('/')
			setIsSigningOut(false)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label={t('aria.openUserMenu')}
					className="relative h-8 w-8 rounded-full"
				>
					<Avatar className="h-8 w-8 border border-zinc-500/50">
						<AvatarFallback suppressHydrationWarning>
							{getAvatarFallback(user.email || '')}
						</AvatarFallback>
					</Avatar>
					{user.email?.split('@')[0] && (
						<span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white">
							<span className="sr-only">{t('user.online')}</span>
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium">{user.email}</p>
						<p className="text-xs text-muted-foreground">{user.name}</p>
					</div>
				</DropdownMenuLabel>
				{user.device?.address && (
					<DropdownMenuLabel asChild>
						<WalletCopyButton address={user.device.address} />
					</DropdownMenuLabel>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/profile" className="cursor-pointer">
						<UserIcon className="mr-2 h-4 w-4" />
						{t('nav.dashboard')}
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<button
						type="button"
						onClick={handleSignOutAction}
						disabled={isSigningOut}
						className="flex w-full items-center cursor-pointer"
					>
						<LogOut className="mr-2 h-4 w-4" />
						{isSigningOut
							? t('auth.signingOut') || 'Signing out...'
							: t('nav.closeSession')}
					</button>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

const AuthButtons = () => {
	const { t } = useI18n()
	return (
		<div className="flex items-center gap-2">
			<Link href="/sign-in" passHref>
				<Button variant="ghost" size="sm" className="hidden sm:inline-flex">
					{t('nav.signIn')}
				</Button>
			</Link>
			<Link href="/sign-up" passHref>
				<Button variant="default" size="sm" className="hidden sm:inline-flex">
					{t('nav.signUp')}
				</Button>
			</Link>
		</div>
	)
}

const MobileNavigation = () => {
	const { t } = useI18n()
	return (
		<nav className="flex flex-col space-y-4">
			<Link
				href="/projects"
				className="text-sm font-medium transition-colors hover:text-primary"
			>
				{t('nav.projects')}
			</Link>
			<Link
				href="/about"
				className="text-sm font-medium transition-colors hover:text-primary"
			>
				{t('nav.about')}
			</Link>
			{/* Add other navigation items */}
		</nav>
	)
}

const MobileUserMenu = ({ user }: { user: User }) => {
	const router = useRouter()
	const { t } = useI18n()
	const { disconnect } = useWallet()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const handleSignOutAction = async () => {
		if (isSigningOut) return

		try {
			setIsSigningOut(true)

			// Disconnect wallet/passkey first
			try {
				disconnect()
			} catch (error) {
				console.error('Error disconnecting wallet:', error)
				// Continue with sign out even if wallet disconnect fails
			}

			// Then sign out from Supabase
			// Note: signOutAction may throw a NEXT_REDIRECT error, which is expected
			// and should be allowed to propagate so Next.js can handle the redirect
			await signOutAction()
		} catch (error) {
			// Check if this is a Next.js redirect error (which is expected)
			// @ts-expect-error - NEXT_REDIRECT is a special Next.js error type
			if (
				error &&
				typeof error === 'object' &&
				'digest' in error &&
				error.digest?.startsWith('NEXT_REDIRECT')
			) {
				// This is a redirect, let it propagate
				throw error
			}

			// Handle actual errors
			console.error('Error signing out:', error)
			toast.error(t('auth.signOutError') || 'Error signing out')
			// Redirect to home even on error
			router.push('/')
			setIsSigningOut(false)
		}
	}

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex items-center space-x-4">
				<Avatar className="h-8 w-8">
					<AvatarFallback suppressHydrationWarning>
						{getAvatarFallback(user.email || '')}
					</AvatarFallback>
				</Avatar>
				<div className="space-y-1">
					<p className="text-sm font-medium">{user.email}</p>
					<p className="text-xs text-muted-foreground">{t('user.account')}</p>
				</div>
			</div>
			{user.device?.address && (
				<WalletCopyButton address={user.device.address} className="w-full" />
			)}
			<div className="flex flex-col space-y-2">
				<Link href="/profile">
					<Button variant="ghost" className="w-full justify-start">
						<UserIcon className="mr-2 h-4 w-4" />
						{t('nav.dashboard')}
					</Button>
				</Link>
				<Button
					variant="ghost"
					className="w-full justify-start"
					type="button"
					onClick={handleSignOutAction}
					disabled={isSigningOut}
				>
					<LogOut className="mr-2 h-4 w-4" />
					{isSigningOut
						? t('auth.signingOut') || 'Signing out...'
						: t('nav.signOut')}
				</Button>
			</div>
		</div>
	)
}

const MobileAuthButtons = () => {
	const { t } = useI18n()
	return (
		<div className="flex flex-col space-y-2">
			<Link href="/sign-in">
				<Button variant="ghost" className="w-full justify-start">
					{t('nav.signIn')}
				</Button>
			</Link>
			<Link href="/sign-up">
				<Button variant="default" className="w-full justify-start">
					{t('nav.signUp')}
				</Button>
			</Link>
		</div>
	)
}
