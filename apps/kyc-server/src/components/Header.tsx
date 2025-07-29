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
		{ path: '/react-demo', label: 'React Demo' },
		{ path: '/websocket-demo', label: 'WebSocket Demo' },
		{ path: '/about', label: 'About' },
	]

	const innerNavItems = [
		{ path: '/dashboard', label: 'Dashboard' },
		{ path: '/dashboard/customers', label: 'Customers' },
		{ path: '/dashboard/projects', label: 'Projects' },
		{ path: '/dashboard/analytics', label: 'Analytics' },
		{ path: '/dashboard/settings', label: 'Settings' },
	]

	return (
		<div className="bg-white border-b border-gray-200">
			{/* Top Navigation Bar */}
			<div className="px-6 py-4 flex items-center justify-between border-b">
				{/* Brand Logo */}
				<div className="text-2xl font-semibold text-gray-900">
					<Link to="/dashboard">
						<span className="text-gray-900">KindFi</span> KYC Server
					</Link>
				</div>

				{/* Desktop Navigation */}
				<div className="hidden md:flex items-center space-x-6">
					{mainNavItems.map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={`py-2 px-3 text-base font-medium rounded-md transition-colors ${
								currentPath.startsWith(item.path)
									? 'bg-black text-white'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
							}`}
						>
							{item.label}
						</Link>
					))}

					{/* User Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative w-8 h-8 rounded-full p-0"
							>
								<User className="w-5 h-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="!w-[10rem] z-50" align="end">
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
					<div className="absolute top-16 left-0 w-full bg-white dark:bg-zinc-900 shadow-md z-90 flex flex-col space-y-1 px-4 py-4 md:hidden">
						{mainNavItems.map((item) => (
							<Link
								key={item.path}
								to={item.path}
								onClick={() => setMobileMenuOpen(false)}
								className={`block py-2 px-3 rounded-md text-base font-medium ${
									currentPath.startsWith(item.path)
										? 'bg-black text-white'
										: 'text-gray-600 hover:bg-gray-100'
								}`}
							>
								{item.label}
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Inner Navigation Tabs */}
			<div className="px-8 border-b  pb-3">
				<div className="flex space-x-12">
					{innerNavItems.map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								'py-3 px-3 border-b-2 font-medium  rounded-md text-base transition-colors',
								currentPath.startsWith(item.path)
									? 'bg-gray-900 text-red-400 border-red-400'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
							)}
							style={{
								backgroundColor: currentPath.startsWith(item.path)
									? 'black'
									: 'transparent',
								color: currentPath.startsWith(item.path) ? 'white' : 'gray',
							}}
						>
							{item.label}
						</Link>
					))}
				</div>
			</div>

			{/* Click outside to close dropdown */}
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
