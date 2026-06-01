'use client'

interface QARealtimeStatusProps {
	status: string
	isActive: boolean
}

export const QARealtimeStatus = ({ status, isActive }: QARealtimeStatusProps) => {
	return (
		<div
			className={`mb-4 py-2 px-3 text-sm rounded-md ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 bg-gray-50'}`}
		>
			<div className="flex gap-2 items-center">
				{isActive && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
				{status}
			</div>
		</div>
	)
}
