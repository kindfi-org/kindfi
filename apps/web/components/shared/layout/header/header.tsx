'use client'

import {
	ClipboardCheckIcon,
	ClipboardCopyIcon,
	CopyIcon,
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
import { useAuth } from '~/hooks/use-auth'
import { getAvatarFallback } from '~/lib/utils'
import { Navigation } from './navigation'

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const { user } = useAuth()
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
						{user ? <UserMenu user={user} /> : <AuthButtons />}

						{/* Mobile menu */}
						<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
							<SheetTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									aria-label="Open Mobile Navigation Menu"
									className="md:hidden"
								>
									<Menu className="h-5 w-5" />
								</Button>
							</SheetTrigger>
							<SheetContent side="right" className="w-80">
								<SheetHeader>
									<SheetTitle>Menu</SheetTitle>
								</SheetHeader>
								<div className="mt-8 flex flex-col gap-4">
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

const UserMenu = ({ user }: { user: User }) => {
	const router = useRouter()
	const [addressCopied, setAddressCopied] = useState(false)

	const handleSignOutAction = async () => {
		try {
			await signOutAction()
			router.push('/')
		} catch (error) {
			console.error('Error signing out:', error)
		}
	}

	const copyAddress = async () => {
		if (!user.device?.address) return

		try {
			await navigator.clipboard.writeText(user.device.address)
			setAddressCopied(true)
			toast('Address copied successfully!')
			setTimeout(() => setAddressCopied(false), 2000)
		} catch (error) {
			console.error('Failed to copy address:', error)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label="Open User Account Menu"
					className="relative h-8 w-8 rounded-full"
				>
					<Avatar className="h-8 w-8 border border-zinc-500/50">
						<AvatarFallback suppressHydrationWarning>
							{user.email?.[0].toUpperCase()}
						</AvatarFallback>
					</Avatar>
					{user.email?.split('@')[0] && (
						<span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white">
							<span className="sr-only">Online</span>
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
						<Button
							onClick={copyAddress}
							className="flex w-full justify-between"
						>
							<span className="text-sm font-medium text-muted-foreground">
								{user.device.address.substring(0, 6)}
								{'...'}
								{user.device.address.substring(user.device.address.length - 6)}
							</span>
							{addressCopied ? (
								<ClipboardCheckIcon className="size-4" />
							) : (
								<ClipboardCopyIcon className="size-4" />
							)}
						</Button>
					</DropdownMenuLabel>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/protected" className="cursor-pointer">
						<UserIcon className="mr-2 h-4 w-4" />
						Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<form action={handleSignOutAction} className="w-full">
						<button type="submit" className="flex w-full items-center">
							<LogOut className="mr-2 h-4 w-4" />
							Close session
						</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

const AuthButtons = () => {
	return (
		<div className="flex items-center gap-2">
			<Link href="/sign-in" passHref>
				<Button variant="ghost" size="sm" className="hidden sm:inline-flex">
					Sign in
				</Button>
			</Link>
			<Link href="/sign-up" passHref>
				<Button variant="default" size="sm" className="hidden sm:inline-flex">
					Sign up
				</Button>
			</Link>
		</div>
	)
}

const MobileNavigation = () => {
	return (
		<nav className="flex flex-col space-y-4">
			<Link
				href="/projects"
				className="text-sm font-medium transition-colors hover:text-primary"
			>
				Social Projects
			</Link>
			<Link
				href="/about"
				className="text-sm font-medium transition-colors hover:text-primary"
			>
				About KindFi
			</Link>
			{/* Add other navigation items */}
		</nav>
	)
}

const MobileUserMenu = ({ user }: { user: User }) => {
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
					<p className="text-xs text-muted-foreground">Account</p>
				</div>
			</div>
			<div className="flex flex-col space-y-2">
				<Link href="/protected">
					<Button variant="ghost" className="w-full justify-start">
						<UserIcon className="mr-2 h-4 w-4" />
						Dashboard
					</Button>
				</Link>
				<Link href="/settings">
					<Button
						variant="ghost"
						aria-label="Settings"
						className="w-full justify-start"
					>
						<Settings className="mr-2 h-4 w-4" />
						Config
					</Button>
				</Link>
				<form action={signOutAction}>
					<Button
						variant="ghost"
						className="w-full justify-start"
						type="submit"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Sign Out
					</Button>
				</form>
			</div>
		</div>
	)
}

const MobileAuthButtons = () => {
	return (
		<div className="flex flex-col space-y-2">
			<Link href="/sign-in">
				<Button variant="ghost" className="w-full justify-start">
					Sign in
				</Button>
			</Link>
			<Link href="/sign-up">
				<Button variant="default" className="w-full justify-start">
					Sign up
				</Button>
			</Link>
		</div>
	)
}
