import {
	Banknote,
	Calendar,
	CreditCard,
	DollarSign,
	Info,
	TrendingDown,
	Wallet,
} from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'

interface FinancialMetric {
	id: string
	title: string
	value: string
	icon: React.ReactNode
	iconBgColor: string
	textColor?: string
	percentage?: number
}

const financialMetrics: FinancialMetric[] = [
	{
		id: 'revenue',
		title: 'Revenue',
		value: '$0',
		icon: <DollarSign className="h-6 w-6 text-blue-600" />,
		iconBgColor: 'bg-blue-100 group-hover:bg-blue-200',
	},
	{
		id: 'net-loss',
		title: 'Net Loss',
		value: '-$818,451',
		icon: <TrendingDown className="h-6 w-6 text-red-600" />,
		iconBgColor: 'bg-red-100 group-hover:bg-red-200',
		textColor: 'text-red-600',
	},
	{
		id: 'short-term-debt',
		title: 'Short-Term Debt',
		value: '$128,720',
		icon: <CreditCard className="h-6 w-6 text-orange-600" />,
		iconBgColor: 'bg-orange-100 group-hover:bg-orange-200',
		percentage: 8,
	},
	{
		id: 'raised',
		title: 'Raised in 2023',
		value: '$2,075,621',
		icon: <Banknote className="h-6 w-6 text-green-600" />,
		iconBgColor: 'bg-green-100 group-hover:bg-green-200',
	},
	{
		id: 'cash',
		title: 'Cash Available',
		value: '$250,000',
		icon: <Wallet className="h-6 w-6 text-purple-600" />,
		iconBgColor: 'bg-purple-100 group-hover:bg-purple-200',
	},
]

const summaryText =
	'Our financial statements end on December 31, 2023. Our current cash balance is $250,000 as of October 2024. During the previous three months, average monthly revenue was $0, average cost of goods sold was $0, and average operating expenses were $100,000 per month.'

const burnRateText =
	'At the current burn rate of $100,000 per month, the company has approximately 2.5 months of runway remaining. This fundraising round is critical to extend operations and reach key milestones.'

export function FinancialSummary() {
	return (
		<div className="space-y-6 mt-10">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold tracking-tight">Financial Summary</h2>
				<Badge
					variant="outline"
					className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200 flex items-center gap-1"
				>
					<Calendar className="w-4 h-4" />
					<span className="font-bold">Q4 2023</span>
				</Badge>
			</div>

			<div className="rounded-lg shadow-md p-6 space-y-6">
				<p className="text-gray-700 leading-relaxed">{summaryText}</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
					{financialMetrics.map((metric) => (
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
								<p className="text-blue-800 mt-1">{burnRateText}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
