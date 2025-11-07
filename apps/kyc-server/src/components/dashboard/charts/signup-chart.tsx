import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '~/components/base/chart'
import { useSignupChartConfig } from '~/hooks/use-signup-chart-config'
import { formatDateTick } from '~/lib/chart'
import type { ChartDataPoint } from '~/lib/types/dashboard'
import { TimeRangeSelector } from './time-range-selector'

interface SignupChartProps {
	data: ChartDataPoint[]
}

export function SignupChart({ data }: SignupChartProps) {
	const { chartConfig, timeRange, setTimeRange, filteredData } =
		useSignupChartConfig(data)

	return (
		<Card className="@container/card">
			<CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex flex-col gap-1">
					<CardTitle className="text-lg sm:text-xl">New User Signups</CardTitle>
					<CardDescription className="text-sm">
						User registrations in the last{' '}
						{timeRange === '7d'
							? '7 days'
							: timeRange === '30d'
								? '30 days'
								: '3 months'}
					</CardDescription>
				</div>

				<div className="mt-2 sm:mt-0">
					<TimeRangeSelector
						timeRange={timeRange}
						onTimeRangeChange={setTimeRange}
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
							<linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-signups)"
									stopOpacity={1.0}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-signups)"
									stopOpacity={0.1}
								/>
							</linearGradient>
							<linearGradient id="fillKycStarts" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="var(--color-kycStarts)"
									stopOpacity={0.8}
								/>
								<stop
									offset="95%"
									stopColor="var(--color-kycStarts)"
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
							dataKey="kycStarts"
							type="natural"
							fill="url(#fillKycStarts)"
							stroke="var(--color-kycStarts)"
							stackId="a"
						/>
						<Area
							dataKey="signups"
							type="natural"
							fill="url(#fillSignups)"
							stroke="var(--color-signups)"
							stackId="a"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<CardFooter>
				<div className="text-xs text-muted-foreground">
					Showing user registrations and KYC process initiations over time.
					Updated in real-time.
				</div>
			</CardFooter>
		</Card>
	)
}
