import type { ReactNode } from 'react'
import About from '~/pages/About'
import Dashboard from '~/pages/dashboard'
import Customers from '~/pages/dashboard/customers'
import Users from '~/pages/dashboard/users'
import WebSocketDemo from '../pages/WebSocketDemo'

// Centralized content map for both client and server
export const contentMap: Record<string, ReactNode> = {
	'/': 'Welcome to Kindfi KYC Server!',
	'/dashboard': <Dashboard />,
	'/dashboard/users': <Users />,
	'/react': 'This page is server-side rendered with React and Bun!',
	'/websocket': <WebSocketDemo />,
	'/about': <About />,
	'/dashboard/customers': <Customers />,
}

// Helper function to get content with a fallback
export function getContent(
	path: string,
	fallback: ReactNode = 'Welcome to Kindfi KYC Server!',
): ReactNode {
	return contentMap[path] || fallback
}
