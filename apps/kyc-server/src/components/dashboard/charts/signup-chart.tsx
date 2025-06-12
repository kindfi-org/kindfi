import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '~/components/base/chart'
import { useSignupChartConfig } from '~/hooks/use-signup-chart-config'
import type { ChartDataPoint } from '~/lib/types/dashboard'
import { formatDateTick } from '~/utils/chart'
import { TimeRangeSelector } from './time-range-selector'

interface SignupChartProps {
	data: ChartDataPoint[]
	title?: string
	description?: string
}

export function SignupChart({
	data,
	title = 'New User Signups',
	description,
}: SignupChartProps) {
	const { chartConfig, timeRange, setTimeRange, filteredData, isMobile } =
		useSignupChartConfig(data)

	return (
		<Card className="@container/card">
			<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
					<CardDescription className="text-sm">
						<span className="hidden sm:inline">
							KYC registrations for the last 3 months
						</span>
						<span className="inline sm:hidden">Last 3 months</span>
					</CardDescription>
				</div>

				<div className="mt-2 sm:mt-0">
					<TimeRangeSelector
						timeRange={timeRange}
						onTimeRangeChange={setTimeRange}
						isMobile={isMobile}
					/>
				</div>
			</CardHeader>

			<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full"
				>
					<AreaChart data={filteredData}>
						<defs>
							<linearGradient id="fillBasic" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-basic)"
									stopOpacity={1.0}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-basic)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillEnhanced" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-enhanced)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-enhanced)"
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={formatDateTick}
						/>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									labelFormatter={(value) => {
										return new Date(value).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
										})
									}}
									indicator="dot"
								/>
							}
						/>
						<Area
							dataKey="enhanced"
							type="natural"
							fill="url(#fillEnhanced)"
							stroke="var(--color-enhanced)"
							stackId="a"
						/>
						<Area
							dataKey="basic"
							type="natural"
							fill="url(#fillBasic)"
							stroke="var(--color-basic)"
							stackId="a"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
