'use client'

import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { ExternalLink, LogOut, User as UserIcon, Wallet } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from 'next-auth'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import { useWallet } from '~/hooks/contexts/use-stellar-wallet.context'
import { useI18n } from '~/lib/i18n/context'
import { cn, getAvatarFallback } from '~/lib/utils'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'

const WalletCopyButton = ({
	address,
	className,
}: {
	address: string
	className?: string
}) => {
	const explorerUrl = getStellarExplorerUrl(address)
	const { t } = useI18n()

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
				className="flex w-full items-center justify-between gap-2 px-3 py-2"
			>
				<div className="flex items-center gap-2 min-w-0">
					<Wallet className="size-4 text-muted-foreground shrink-0" />
					<span className="text-sm font-mono text-muted-foreground truncate">
						{start}...{end}
					</span>
				</div>
				<ExternalLink className="size-4 text-muted-foreground shrink-0" />
			</a>
		</Button>
	)
}

export const MobileNavigation = () => {
	const pathname = usePathname()
	const { t } = useI18n()

	const isActive = (path: string) => {
		if (path === '/projects') {
			return pathname === '/projects' || pathname?.startsWith('/projects/')
		}
		if (path === '/about') {
			return pathname === '/about'
		}
		if (path === '/news') {
			return pathname?.startsWith('/news')
		}
		return false
	}

	return (
		<nav className="flex flex-col space-y-1">
			<Link
				href="/projects"
				className={cn(
					'text-sm font-medium transition-colors px-3 py-2 rounded-md',
					isActive('/projects')
						? 'bg-green-900/10 text-green-900 font-semibold'
						: 'hover:bg-green-900/10 hover:text-green-900',
				)}
			>
				{t('nav.projects')}
			</Link>
			<Link
				href="/about"
				className={cn(
					'text-sm font-medium transition-colors px-3 py-2 rounded-md',
					isActive('/about')
						? 'bg-green-900/10 text-green-900 font-semibold'
						: 'hover:bg-green-900/10 hover:text-green-900',
				)}
			>
				{t('nav.about')}
			</Link>
			<Link
				href="/news"
				className={cn(
					'text-sm font-medium transition-colors px-3 py-2 rounded-md',
					isActive('/news')
						? 'bg-green-900/10 text-green-900 font-semibold'
						: 'hover:bg-green-900/10 hover:text-green-900',
				)}
			>
				{t('nav.news')}
			</Link>
		</nav>
	)
}

export const MobileUserMenu = ({ user }: { user: User }) => {
	const router = useRouter()
	const { t } = useI18n()
	const { disconnect } = useWallet()
	const [isSigningOut, setIsSigningOut] = useState(false)

	const handleSignOutAction = async () => {
		if (isSigningOut) return

		try {
			setIsSigningOut(true)

			try {
				disconnect()
			} catch (error) {
				console.error('Error disconnecting wallet:', error)
			}

			try {
				const supabase = createSupabaseBrowserClient()
				await supabase.auth.signOut()
			} catch (error) {
				console.error('Error signing out from Supabase:', error)
			}

			await signOut({
				callbackUrl: '/sign-in?success=Successfully signed out',
			})
		} catch (error) {
			console.error('Error signing out:', error)
			toast.error(t('auth.signOutError'))
			router.push('/')
			setIsSigningOut(false)
		}
	}

	return (
		<div className="flex flex-col space-y-4 pt-4 border-t">
			<div className="flex items-center space-x-3 px-2">
				<Avatar className="h-10 w-10 border-2 border-border">
					<AvatarFallback suppressHydrationWarning>
						{getAvatarFallback(user.email || '')}
					</AvatarFallback>
				</Avatar>
				<div className="flex flex-col space-y-0.5 min-w-0 flex-1">
					<p className="text-sm font-semibold leading-none truncate">
						{user.name || user.email}
					</p>
					<p className="text-xs text-muted-foreground leading-none truncate">
						{user.email}
					</p>
				</div>
				{user.email?.split('@')[0] && (
					<span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0">
						<span className="sr-only">{t('user.online')}</span>
					</span>
				)}
			</div>
			{user.device?.address && (
				<div className="px-2">
					<WalletCopyButton address={user.device.address} className="w-full" />
				</div>
			)}
			<div className="flex flex-col space-y-1">
				<Link href="/profile">
					<Button variant="ghost" className="w-full justify-start font-medium">
						<UserIcon className="mr-2 h-4 w-4" />
						{t('nav.dashboard')}
					</Button>
				</Link>
				<Button
					variant="ghost"
					className="w-full justify-start text-destructive hover:text-destructive font-medium"
					type="button"
					onClick={handleSignOutAction}
					disabled={isSigningOut}
				>
					<LogOut className="mr-2 h-4 w-4" />
					{isSigningOut ? t('auth.signingOut') : t('nav.closeSession')}
				</Button>
			</div>
		</div>
	)
}

export const MobileAuthButtons = () => {
	const { t } = useI18n()
	return (
		<div className="flex flex-col space-y-2 pt-4 border-t">
			<Link href="/sign-in">
				<Button variant="ghost" className="w-full justify-start font-medium">
					{t('nav.signIn')}
				</Button>
			</Link>
			<Link href="/sign-up">
				<Button variant="default" className="w-full justify-start font-medium">
					{t('nav.signUp')}
				</Button>
			</Link>
		</div>
	)
}
