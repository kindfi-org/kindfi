import { Link, Outlet, useLocation } from 'react-router-dom'
import { ToastProvider, ToastViewport } from '~/components/base/toast'

export function App() {
	const location = useLocation()

	return (
		<ToastProvider>
			<nav>
				<ul>
					<li>
						<Link to="/" className={location.pathname === '/' ? 'active' : ''}>
							Dashboard
						</Link>
					</li>
					<li>
						<Link
							to="/users"
							className={location.pathname === '/users' ? 'active' : ''}
						>
							Users
						</Link>
					</li>
					<li>
						<Link
							to="/websocket"
							className={location.pathname === '/websocket' ? 'active' : ''}
						>
							WS Health
						</Link>
					</li>
					<li>
						<Link
							to="/about"
							className={location.pathname === '/about' ? 'active' : ''}
						>
							About
						</Link>
					</li>
				</ul>
			</nav>
			<Outlet />
			<ToastViewport />
		</ToastProvider>
	)
}
