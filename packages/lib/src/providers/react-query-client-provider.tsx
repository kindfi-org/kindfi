'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

/**
 * Provides a QueryClient context to the React component tree.
 *
 * Sets a default `staleTime` to avoid refetching immediately on the client.
 *
 * @param children Components that need React Query access.
 *
 * @example
 * <ReactQueryClientProvider>
 *   <MyApp />
 * </ReactQueryClientProvider>
 */
export const ReactQueryClientProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// With SSR, we usually want to set some default staleTime
						// above 0 to avoid refetching immediately on the client
						staleTime: 60 * 1000,
					},
				},
			}),
	)
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}
