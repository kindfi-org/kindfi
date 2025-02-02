'use client'

import type { User } from '@supabase/supabase-js'
import { LogOut, Menu, Settings, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { signOutAction } from '~/app/actions'
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
import { Navigation } from './navigation'

export const Header = () => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const { user } = useAuth()
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto">
				<div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
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
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					aria-label="Open User Account Menu"
					className="relative h-8 w-8 rounded-full"
				>
					<Avatar className="h-8 w-8">
						<AvatarFallback suppressHydrationWarning>
							{user.email?.[0].toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium">{user.email}</p>
						<p className="text-xs text-muted-foreground">Account</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/protected" className="cursor-pointer">
						<UserIcon className="mr-2 h-4 w-4" />
						Dashboard
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<Link href="/settings" className="cursor-pointer">
						<Settings className="mr-2 h-4 w-4" />
						Config
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<form action={signOutAction} className="w-full">
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
						{user.email?.[0].toUpperCase()}
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
						Close session
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
