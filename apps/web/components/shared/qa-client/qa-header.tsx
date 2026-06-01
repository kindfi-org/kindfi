'use client'

import { Bell, BellOff, RefreshCw } from 'lucide-react'
import { Button } from '~/components/base/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/base/tooltip'

interface QAHeaderProps {
	realtimeActivity: boolean
	isRealtimeEnabled: boolean
	onRefresh: () => void
	onToggleRealtime: () => void
}

export const QAHeader = ({
	realtimeActivity,
	isRealtimeEnabled,
	onRefresh,
	onToggleRealtime,
}: QAHeaderProps) => {
	return (
		<h2 className="flex justify-between items-center mb-4 text-2xl font-bold">
			<span>Community Q&A</span>
			<div className="flex gap-2 items-center">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={`rounded-full w-9 h-9 p-0 ${realtimeActivity ? 'bg-blue-50' : ''}`}
								onClick={onRefresh}
								aria-label="Refresh Q&A"
							>
								<RefreshCw
									className={`h-4 w-4 ${realtimeActivity ? 'text-blue-600 animate-spin' : ''}`}
									aria-hidden="true"
								/>
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>Manually refresh Q&A</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={`rounded-full w-9 h-9 p-0 ${isRealtimeEnabled ? 'bg-blue-50' : ''}`}
								onClick={onToggleRealtime}
								aria-label={
									isRealtimeEnabled
										? 'Disable real-time updates'
										: 'Enable real-time updates'
								}
							>
								{isRealtimeEnabled ? (
									<Bell
										className="w-4 h-4 text-blue-600"
										aria-hidden="true"
									/>
								) : (
									<BellOff className="w-4 h-4" aria-hidden="true" />
								)}
							</Button>
						</TooltipTrigger>
						<TooltipContent>
							<p>
								{isRealtimeEnabled
									? 'Disable real-time updates'
									: 'Enable real-time updates'}
							</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</h2>
	)
}
