import type { ReactNode } from 'react'
import About from '~/pages/about'
import Dashboard from '~/pages/dashboard'
import Users from '~/pages/dashboard/users'
import WebSocketDemo from '../pages/websocket-health'

// Centralized content map for both client and server
export const contentMap: Record<string, ReactNode> = {
	'/': <Dashboard />,
	'/users': <Users />,
	'/websocket': <WebSocketDemo />,
	'/about': <About />,
}

// Helper function to get content with a fallback
export function getContent(
	path: string,
	fallback: ReactNode = 'Welcome to Kindfi KYC Server!',
): ReactNode {
	return contentMap[path] || fallback
}
