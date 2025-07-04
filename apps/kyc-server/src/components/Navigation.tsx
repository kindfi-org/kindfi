interface NavigationProps {
	currentPath: string
}

// Define our navigation routes in one place
export const routes = [
	{ path: '/', label: 'Home' },
	{ path: '/dashboard', label: 'Dashboard' },
	{ path: '/react', label: 'React Demo' },
	{ path: '/websocket', label: 'WebSocket Demo' },
	{ path: '/about', label: 'About' },
	// Add new routes here
	// { path: '/new-feature', label: 'New Feature' },
]

// Log the routes for debugging
console.log('Navigation routes defined:', routes.map((r) => r.path).join(', '))

export function Navigation({ currentPath }: NavigationProps) {
	// Log when the Navigation component is rendered
	console.log('Navigation component rendering with currentPath:', currentPath)

	return (
		<nav className="border-b border-border mb-4">
			<ul className="flex space-x-4 p-4 bg-card text-foreground">
				{routes.map((route) => {
					const isActive = currentPath === route.path
					console.log(
						`Route ${route.path} is ${isActive ? 'active' : 'inactive'}`,
					)

					return (
						<li key={route.path}>
							<a
								href={route.path}
								className={`px-3 py-2 rounded-md font-medium transition-colors ${
									isActive
										? 'bg-primary text-primary-foreground'
										: 'hover:bg-muted hover:text-foreground/80 text-muted-foreground'
								}`}
							>
								{route.label}
							</a>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
