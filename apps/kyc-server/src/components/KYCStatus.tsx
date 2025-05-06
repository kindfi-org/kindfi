'use client'

import { useEffect, useState } from 'react'
import { useKYCWebSocket } from '../hooks/useKYCWebSocket'

interface KYCStatusProps {
	userId: string
}

export function KYCStatus({ userId }: KYCStatusProps) {
	const [status, setStatus] = useState<string>('pending')
	const { isConnected, lastUpdate } = useKYCWebSocket({
		userId,
		onUpdate: (update) => {
			setStatus(update.status)
		},
	})

	useEffect(() => {
		if (lastUpdate) {
			setStatus(lastUpdate.status)
		}
	}, [lastUpdate])

	return (
		<div className="p-4 rounded-lg bg-white shadow-sm">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">KYC Status</h3>
				<div className="flex items-center space-x-2">
					<div
						className={`w-2 h-2 rounded-full ${
							isConnected ? 'bg-green-500' : 'bg-red-500'
						}`}
					/>
					<span className="text-sm text-gray-500">
						{isConnected ? 'Connected' : 'Disconnected'}
					</span>
				</div>
			</div>
			<div className="mt-4">
				<div className="flex items-center space-x-2">
					<span className="text-sm font-medium">Current Status:</span>
					<span
						className={`px-2 py-1 text-xs font-medium rounded-full ${
							status === 'approved'
								? 'bg-green-100 text-green-800'
								: status === 'rejected'
									? 'bg-red-100 text-red-800'
									: 'bg-yellow-100 text-yellow-800'
						}`}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</span>
				</div>
				{lastUpdate && (
					<p className="mt-2 text-sm text-gray-500">
						Last updated: {new Date(lastUpdate.timestamp).toLocaleString()}
					</p>
				)}
			</div>
		</div>
	)
}
