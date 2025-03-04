import React from 'react'

interface NavigationProps {
	currentPath: string
}

// Define our navigation routes in one place
export const routes = [
	{ path: '/', label: 'Home' },
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
		<nav>
			<ul>
				{routes.map((route) => {
					const isActive = currentPath === route.path
					console.log(
						`Route ${route.path} is ${isActive ? 'active' : 'inactive'}`,
					)

					return (
						<li key={route.path}>
							<a href={route.path} className={isActive ? 'active' : ''}>
								{route.label}
							</a>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}
