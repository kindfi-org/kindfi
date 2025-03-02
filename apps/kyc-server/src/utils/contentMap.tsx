import React from 'react'
import type { ReactNode } from 'react'
import { About } from '../components/About'
import { WebSocketDemo } from '../components/WebSocketDemo'

// Centralized content map for both client and server
export const contentMap: Record<string, ReactNode> = {
	'/': 'Welcome to Kindfi KYC Server!',
	'/react': 'This page is server-side rendered with React and Bun!',
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
