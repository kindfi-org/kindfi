import { Calendar, Info } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import { financialOverview } from '~/lib/mock-data/project/mock-overview-section'

export function FinancialSummary() {
	return (
		<div className="space-y-6 mt-10">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">Financial Summary</h2>
				<Badge
					variant="outline"
					className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200 flex items-center gap-1"
				>
					<Calendar className="w-4 h-4" />
					<span className="font-bold">{financialOverview.period}</span>
				</Badge>
			</div>

			<div className="rounded-lg shadow-md p-6 space-y-6">
				<p className="text-gray-700 leading-relaxed">
					{financialOverview.summaryText}
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
					{financialOverview.metrics.map((metric) => (
						<Card
							key={metric.id}
							className="group border-gray-200 hover:border-blue-200 hover:shadow-md"
						>
							<CardContent className="p-4 space-y-4">
								<div
									className={`w-12 h-12 rounded-md flex items-center justify-center transition-colors ${metric.iconBgColor}`}
								>
									{metric.icon}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h3
											className={`text-2xl font-bold ${metric.textColor || ''}`}
										>
											{metric.value}
										</h3>
										{metric.percentage !== undefined && (
											<Badge
												variant="outline"
												className="bg-red-100 text-red-800 border-red-200"
											>
												{metric.percentage}%
											</Badge>
										)}
									</div>
									<p className="text-gray-500 uppercase text-sm font-medium mt-1">
										{metric.title}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				<Card className="border-gray-200 bg-blue-50">
					<CardContent className="p-6">
						<div className="flex gap-3">
							<Info className="h-5 w-5 text-blue-700 flex-shrink-0 mt-1" />
							<div>
								<h3 className="text-xl font-medium text-blue-900">
									Burn Rate Analysis
								</h3>
								<p className="text-blue-800 mt-1">
									{financialOverview.burnRateText}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
