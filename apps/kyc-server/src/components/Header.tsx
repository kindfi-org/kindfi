/** biome-ignore-all assist/source/organizeImports: any */
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu'
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '~/lib/utils'
import { Button } from './base/button'
import { useTheme } from '~/hooks/use-theme'

const Header = () => {
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
	const { theme, toggleTheme } = useTheme()
	const location = useLocation()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const currentPath = location.pathname

	const mainNavItems = [
		{ path: '/signin', label: 'Sign In' },
		{ path: '/dashboard', label: 'Dashboard', active: true },
		{ path: '/react', label: 'React Demo' },
		{ path: '/websocket', label: 'WebSocket Demo' },
		{ path: '/about', label: 'About' },
	]

	const innerNavItems = [
		{ path: '/dashboard', label: 'Dashboard' },
		{ path: '/dashboard/users', label: 'Users' },
		{ path: '/dashboard/projects', label: 'Projects' },
		{ path: '/dashboard/analytics', label: 'Analytics' },
		{ path: '/dashboard/settings', label: 'Settings' },
	]

	return (
		<div className="border-b border-border bg-background">
			{/* Top Navigation Bar */}
			<div className="px-6 py-4 flex items-center justify-between border-b border-border">
				{/* Brand Logo */}
				<div className="text-2xl font-semibold">
					<Link to="/dashboard">
						<span className="text-foreground">
							KindFi KYC Server
						</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center space-x-6">
					{mainNavItems.map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								'py-2 px-3 text-base font-medium rounded-md transition-colors',
								currentPath === item.path
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-accent',
							)}
						>
							{item.label}
						</Link>
					))}

					{/* User Dropdown */}
					<div className="relative">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative w-8 h-8 rounded-full p-0"
								>
									<User className="w-5 h-5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="z-50 bg-popover border-border py-4"
								align="end"
								sideOffset={8}
							>
								<DropdownMenuLabel className="text-xs px-2 text-muted-foreground">
									My Account
								</DropdownMenuLabel>
								<DropdownMenuItem className="px-3 py-2 rounded-md hover:bg-muted">
									Preferences
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={toggleTheme}
									className="px-3 py-2 rounded-md hover:bg-muted"
								>
									{theme === 'dark' ? (
										<div className="flex items-center">
											<Sun className="mr-2 h-4 w-4" /> Light Mode
										</div>
									) : (
										<div className="flex items-center">
											<Moon className="mr-2 h-4 w-4" /> Dark Mode
										</div>
									)}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="px-3 py-2 rounded-md hover:bg-muted text-red-500">
									<div className="flex items-center">
										<LogOut className="h-4 w-4 mr-2" />
										Logout
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Hamburger menu on mobile */}
				<div className="md:hidden flex items-center">
					<button
						type="button"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>

				{/* Mobile menu dropdown */}
				{mobileMenuOpen && (
					<div className="absolute top-16 left-0 w-full bg-popover border-border shadow-md z-90 flex flex-col space-y-1 px-4 py-4 md:hidden">
						{mainNavItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => setMobileMenuOpen(false)}
								className={cn(
									'block py-2 px-3 rounded-md text-base font-medium',
									currentPath === item.path
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-accent hover:text-foreground',
								)}
							>
								{item.label}
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Inner Navigation Tabs */}
			{currentPath.startsWith('/dashboard') && (
				<div className="px-4 py-2 rounded-xl bg-muted inline-flex space-x-2">
					{innerNavItems.map((item) => {
						const isActive = currentPath === item.path
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									'px-4 py-2 text-sm font-medium rounded-md transition-all cursor-pointer',
									isActive
										? 'bg-background text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground',
								)}
							>
								{item.label}
							</Link>
						)
					})}
				</div>
			)}

			{isUserDropdownOpen && (
				<button
					type="button"
					className="fixed inset-0 z-40"
					onClick={() => setIsUserDropdownOpen(false)}
				/>
			)}
		</div>
	)
}

export default Header
