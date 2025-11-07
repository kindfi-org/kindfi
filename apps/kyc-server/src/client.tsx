import React, { Suspense } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { DashboardSkeleton } from './components/dashboard/skeletons/dashboard-skeleton'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import { ThemeProvider } from './components/provider/theme-provider'
import About from './pages/about'
import WebSocketDemo from './pages/websocket-health'

// Lazy load the Users page to reduce initial bundle size
const Users = React.lazy(() => import('./pages/dashboard/users'))
// Lazy load the DashboardPage to reduce initial bundle size
const DashboardPage = React.lazy(() => import('./pages/dashboard'))

import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}
hydrateRoot(
	rootElement,
	<React.StrictMode>
		<ThemeProvider>
			<BrowserRouter>
				<Layout>
					<Routes>
						<Route
							path="/"
							element={
								<ErrorBoundary>
									<Suspense fallback={<DashboardSkeleton />}>
										<DashboardPage />
									</Suspense>
								</ErrorBoundary>
							}
						/>
						<Route path="/about" element={<About />} />
						<Route path="/websocket" element={<WebSocketDemo />} />
						<Route
							path="/users"
							element={
								<ErrorBoundary>
									<Suspense fallback={<DashboardSkeleton />}>
										<Users />
									</Suspense>
								</ErrorBoundary>
							}
						/>
					</Routes>
				</Layout>
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>,
)

hydrateRoot(
	rootElement,
	<React.StrictMode>
		<ThemeProvider>
			<BrowserRouter>
				<Layout>
					<Routes>
						<Route
							path="/"
							element={
								<ErrorBoundary>
									<Suspense fallback={<DashboardSkeleton />}>
										<DashboardPage />
									</Suspense>
								</ErrorBoundary>
							}
						/>
						<Route path="/about" element={<About />} />
						<Route path="/websocket" element={<WebSocketDemo />} />
						<Route
							path="/users"
							element={
								<ErrorBoundary>
									<Suspense fallback={<DashboardSkeleton />}>
										<Users />
									</Suspense>
								</ErrorBoundary>
							}
						/>
					</Routes>
				</Layout>
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>,
)
