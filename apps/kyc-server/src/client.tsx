import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ThemeProvider } from './components/provider/theme-provider'
import About from './pages/About'
import DashboardPage from './pages/dashboard'
import Customers from './pages/dashboard/customers'
import Users from './pages/dashboard/users'
import WebSocketDemo from './pages/WebSocketDemo'

import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}
hydrateRoot(
	rootElement,
	<React.StrictMode>
		<ThemeProvider 
			attribute="class" 
			defaultTheme="system" 
			enableSystem
		>
			<BrowserRouter>
				<Layout>
					<Routes>
						<Route path="/" element={<div className="card"><p>Welcome to Kindfi KYC Server</p></div>} />
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/about" element={<About />} />
						<Route
							path="/react"
							element={<div>This is a React demo page.</div>}
						/>
						<Route path="/websocket" element={<WebSocketDemo />} />
						<Route path="/dashboard/customers" element={<Customers />} />
						<Route path="/dashboard/users" element={<Users />} />
					</Routes>
				</Layout>
			</BrowserRouter>
		</ThemeProvider>
	</React.StrictMode>,
)
