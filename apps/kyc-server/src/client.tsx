import React, { Suspense } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import Layout from './components/Layout'
import { DashboardSkeleton } from './components/dashboard/skeletons/dashboard-skeleton'
import { ThemeProvider } from './components/provider/theme-provider'
import About from './pages/About'
import DashboardPage from './pages/dashboard'
import WebSocketDemo from './pages/WebSocketDemo'

// Lazy load the Users page to reduce initial bundle size
const Users = React.lazy(() => import('./pages/dashboard/users'))

import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}
hydrateRoot(
	rootElement,
	<React.StrictMode>
		<ThemeProvider suppressHydrationWarning>
			<BrowserRouter>
				<Layout>
					<Routes>
						<Route
							path="/"
							element={
								<div className="card">
									<p>Welcome to Kindfi KYC Server</p>
								</div>
							}
						/>
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/about" element={<About />} />
						<Route
							path="/react"
							element={<div>This is a React demo page.</div>}
						/>
						<Route path="/websocket" element={<WebSocketDemo />} />
						<Route 
							path="/dashboard/users" 
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
