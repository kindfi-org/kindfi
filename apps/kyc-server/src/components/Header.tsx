/** biome-ignore-all assist/source/organizeImports: any */
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from '@radix-ui/react-dropdown-menu'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '~/lib/utils'
import { Button } from './base/button'

// Mock useTheme hook since you mentioned you have it
const useTheme = () => {
	const [theme, setTheme] = useState('light')
	const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
	return { theme, toggleTheme }
}

const Header = () => {
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
	const { theme, toggleTheme } = useTheme()
	const currentPath = window.location.pathname

	const mainNavItems = [
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
			<div className="px-8 py-6 flex items-center justify-between">
				{/* Brand Logo */}
				<div className="text-2xl font-semibold text-gray-900">
					<Link to="/dashboard" className="hover:text-gray-900">
						<span className="text-gray-900">KindFi</span> KYC Server
					</Link>
				</div>

				{/* Right Navigation */}
				<div className="flex items-center space-x-8">
					{/* Main Navigation Items */}
					{mainNavItems.map((item) => (
						<Link
							key={item.path}
							to={item.path}
							className={cn(
								'py-3 px-3 text-base font-medium rounded-md transition-colors',
								currentPath.startsWith(item.path)
									? '!bg-black text-white'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
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

					{/* User Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative p-0 w-8 h-8 rounded-full"
							>
								<User className="w-5 h-5" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="!w-[10rem] !z-50 bg-white  dark:bg-zinc-900 rounded-md shadow-xl p-2 space-y-1 z-50"
							align="end"
							style={{ width: '10rem', zIndex: 90, backgroundColor: 'white' }}
						>
							<DropdownMenuLabel className="px-2 text-xs text-muted-foreground">
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
									<div className="flex justify-left items-center ">
										<Sun className="mr-2 h-4 w-4" />
										<span>Light Mode</span>
									</div>
								) : (
									<div className="flex  justify-left items-center">
										<Moon className="mr-2 h-4 w-4" /> Dark Mode
									</div>
								)}
							</DropdownMenuItem>

							<DropdownMenuSeparator />

							<DropdownMenuItem className="px-3 py-2 rounded-md hover:bg-muted text-red-500">
								<div className="flex justify-left items-center">
									<LogOut className="h-4 w-4" />
									<span>Logout</span>
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
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
