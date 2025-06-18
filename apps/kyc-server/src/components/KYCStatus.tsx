'use client'

import { useState } from 'react'
import { cn } from '~/lib/utils'
import { useKYCWebSocket } from '../hooks/use-kyc-ws'

interface KYCStatusProps {
	userId: string
	initialStatus?: 'pending' | 'approved' | 'rejected' | 'verified'
}

export function KYCStatus({
	userId,
	initialStatus = 'pending',
}: KYCStatusProps) {
	type KYCStatusValue = 'pending' | 'approved' | 'rejected' | 'verified'
	const [status, setStatus] = useState<KYCStatusValue>(initialStatus)
	const [isLoading, setIsLoading] = useState(true)
	const { isConnected, lastUpdate, reconnect } = useKYCWebSocket({
		userId,
		onUpdate: (update) => {
			setStatus(update.status as KYCStatusValue)
			setIsLoading(false)
		},
	})

	return (
		<div className="p-4 rounded-lg bg-white shadow-sm">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">KYC Status</h3>
				<div className="flex items-center space-x-2">
					<div
						className={cn(
							'w-2 h-2 rounded-full',
							isConnected ? 'bg-green-500' : 'bg-red-500',
						)}
						aria-hidden="true"
					/>
					<span className="text-sm text-gray-500">
						{isConnected ? 'Connected' : 'Disconnected'}
					</span>
					{!isConnected && (
						<button
							type="button"
							onClick={reconnect}
							className="text-sm text-blue-500 hover:text-blue-600"
						>
							Reconnect
						</button>
					)}
				</div>
			</div>
			<div className="mt-4">
				<div className="flex items-center space-x-2">
					<span className="text-sm font-medium">Current Status:</span>
					{isLoading ? (
						<span className="text-sm text-gray-500">Loading...</span>
					) : (
						<span
							className={cn(
								'px-2 py-1 text-xs font-medium rounded-full',
								status === 'approved' && 'bg-green-100 text-green-800',
								status === 'rejected' && 'bg-red-100 text-red-800',
								status === 'pending' && 'bg-yellow-100 text-yellow-800',
							)}
						>
							{status.charAt(0).toUpperCase() + status.slice(1)}
						</span>
					)}
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
