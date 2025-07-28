import { ChevronDown, LogOut, Moon, Settings, Sun, User } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '~/lib/utils'

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
		{ id: 'dashboard', label: 'Dashboard', active: true },
		{ id: 'react-demo', label: 'React Demo' },
		{ id: 'websocket-demo', label: 'WebSocket Demo' },
		{ id: 'about', label: 'About' },
	]

	const innerNavItems = [
		{ id: 'customers', label: 'Customers' },
		{ id: 'projects', label: 'Projects' },
		{ id: 'analytics', label: 'Analytics' },
		{ id: 'settings', label: 'Settings' },
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
							key={item.id}
							to={`/${item.id}`}
							className={cn(
								'px-4 py-3 text-base font-medium rounded-md transition-colors',
								`/${item.id}` === currentPath
									? 'bg-gray-900 text-white'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
							)}
						>
							{item.label}
						</Link>
					))}

					{/* User Dropdown */}
					<div className="relative">
						<button
							type="button"
							onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
							className="flex items-center space-x-2 px-4 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
						>
							<User className="w-5 h-5" />
							{/* <span>Sign In</span> */}
							<ChevronDown className="w-5 h-5" />
						</button>

						{/* Dropdown Menu */}
						{isUserDropdownOpen && (
							<div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
								<div className="px-5 py-3 text-base text-gray-700 border-b border-gray-100">
									<div className="font-medium">John Doe</div>
									<div className="text-gray-500 text-sm">john@example.com</div>
								</div>

								<Link
									to="/account"
									className="flex items-center w-full px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
								>
									<Settings className="w-5 h-5 mr-3" />
									Account Settings
								</Link>

								<Link
									to="/preferences"
									className="flex items-center w-full px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
								>
									<Settings className="w-5 h-5 mr-3" />
									Preferences
								</Link>

								<button
									type="button"
									onClick={toggleTheme}
									className="flex items-center w-full px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
								>
									{theme === 'light' ? (
										<>
											<Moon className="w-5 h-5 mr-3" />
											Dark Mode
										</>
									) : (
										<>
											<Sun className="w-5 h-5 mr-3" />
											Light Mode
										</>
									)}
								</button>

								<div className="border-t border-gray-100 mt-2">
									<button
										type="button"
										className="flex items-center w-full px-5 py-3 text-base text-gray-700 hover:bg-gray-100"
									>
										<LogOut className="w-5 h-5 mr-3" />
										Sign Out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Inner Navigation Tabs */}
			<div className="px-8 border-b  pb-3">
				<div className="flex space-x-12">
					{innerNavItems.map((item) => (
						<Link
							key={item.id}
							to={`/dashboard/${item.id}`}
							className={cn(
								'py-5 px-2 border-b-2 font-medium text-base transition-colors',
								`/${item.id}` === currentPath
									? 'border-gray-900 text-gray-900'
									: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
							)}
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
