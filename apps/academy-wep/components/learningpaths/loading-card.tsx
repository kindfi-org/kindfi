'use client'

import { Card } from '~/components/base/card'

const LoadingCard: React.FC = () => {
	return (
		<Card className="flex flex-col items-start p-4 space-y-6 bg-white shadow-lg lg:p-6 animate-pulse">
			<div className="p-3 bg-gray-200 rounded-full">
				<div className="w-6 h-6 bg-gray-300 rounded" />
			</div>

			<div className="flex-1 w-full space-y-6">
				<div className="w-3/4 h-6 bg-gray-300 rounded" />
				<div className="w-full h-4 bg-gray-200 rounded" />
				<div className="w-5/6 h-4 bg-gray-200 rounded" />

				<div className="flex flex-wrap gap-4 mt-4">
					<span className="w-24 h-6 bg-gray-200 rounded-full" />
					<span className="w-20 h-6 bg-gray-200 rounded-full" />
					<span className="h-6 bg-gray-200 rounded-full w-28" />
				</div>

				<div className="w-full mt-4">
					<div className="h-12 bg-gray-300 rounded-md" />
				</div>
			</div>
		</Card>
	)
}

export default LoadingCard
