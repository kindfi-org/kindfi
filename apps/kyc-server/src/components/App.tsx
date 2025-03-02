import React from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'

export function App() {
	const location = useLocation()

	return (
		<>
			<nav>
				<ul>
					<li>
						<Link to="/" className={location.pathname === '/' ? 'active' : ''}>
							Home
						</Link>
					</li>
					<li>
						<Link
							to="/react"
							className={location.pathname === '/react' ? 'active' : ''}
						>
							React Demo
						</Link>
					</li>
					<li>
						<Link
							to="/websocket"
							className={location.pathname === '/websocket' ? 'active' : ''}
						>
							WebSocket Demo
						</Link>
					</li>
				</ul>
			</nav>
			<Outlet />
		</>
	)
}
