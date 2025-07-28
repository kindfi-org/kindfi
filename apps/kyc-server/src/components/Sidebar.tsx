// components/Sidebar.jsx
import {
	BarChart3,
	Bell,
	Package2 as Box,
	Home,
	Package2,
	ShoppingCart,
	Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './base/button' // Assuming Button is reused
import { Card, CardContent, CardHeader, CardTitle } from './base/card' // Reuse those components

interface SidebarProps {
	currentPath: string
	navigate: (path: string) => void
}

const Sidebar: React.FC<SidebarProps> = () => {
	const navItems = [
		{ path: '/dashboard', icon: Home, label: 'Dashboard' },
		{ path: '/orders', icon: ShoppingCart, label: 'Orders' },
		{ path: '/products', icon: Box, label: 'Products' },
		{ path: '/customers', icon: Users, label: 'Customers' },
		{ path: '/analytics', icon: BarChart3, label: 'Analytics' },
	]

	return (
		<div className="hidden border-r bg-muted/40 md:block">
			<div className="flex h-full max-h-screen flex-col gap-2">
				{/* Logo/Brand */}
				<div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
					<div className="flex items-center gap-2 font-semibold">
						<Package2 className="h-6 w-6" />
						<span>Acme Inc</span>
					</div>
					<Button variant="outline" size="icon" className="ml-auto h-8 w-8">
						<Bell className="h-4 w-4" />
					</Button>
				</div>

				{/* Navigation */}
				<div className="flex-1">
					<nav className="grid items-start px-2 text-sm font-medium lg:px-4">
						{navItems.map(({ label, icon: Icon, path }) => (
							<Link
								key={path}
								to={path}
								className={`flex items-center gap-2 p-2 rounded hover:bg-muted-foreground/10 ${
									location.pathname === path ? 'bg-muted-foreground/10' : ''
								}`}
							>
								<Icon className="w-5 h-5" />
								<span>{label}</span>
							</Link>
						))}
					</nav>
				</div>

				{/* Upgrade Card */}
				<div className="mt-auto p-4">
					<Card>
						<CardHeader className="p-2 pt-0 md:p-4">
							<CardTitle className="text-sm">Upgrade to Pro</CardTitle>
						</CardHeader>
						<CardContent className="p-2 pt-0 md:p-4 md:pt-0">
							<Button size="sm" className="w-full">
								Upgrade
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default Sidebar
