import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ThemeProvider } from './components/provider/theme-provider'
import About from './pages/About'
import DashboardPage from './pages/Dashboard'

const rootElement = document.getElementById('root')
if (!rootElement) {
	throw new Error('Root element not found')
}
hydrateRoot(
	rootElement,
	<React.StrictMode>
		<BrowserRouter>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<Layout>
					<Routes>
						<Route path="/dashboard" element={<DashboardPage />} />
						<Route path="/about" element={<About />} />
					</Routes>
				</Layout>
			</ThemeProvider>
		</BrowserRouter>
	</React.StrictMode>,
)
