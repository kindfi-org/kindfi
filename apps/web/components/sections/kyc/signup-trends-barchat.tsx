'use client'

import { CalendarDays } from 'lucide-react'
import React from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

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

// Type-only import
import type { JSX } from 'react'
import type { ChartConfig } from '~/components/base/chart'
// ---- 1. Data shape ----
interface SignupDatum {
	week: string
	signups: number
}

// ---- 2. ChartConfig shape ----
interface SignupChartConfig extends ChartConfig {
	signups: {
		label: string
		color: string
	}
	label: {
		color: string
	}
}

// ---- 3. Sample data ----
const signupData: SignupDatum[] = [
	{ week: 'Week 1', signups: 42 },
	{ week: 'Week 2', signups: 58 },
	{ week: 'Week 3', signups: 37 },
	{ week: 'Week 4', signups: 65 },
	{ week: 'Week 5', signups: 49 },
	{ week: 'Week 6', signups: 72 },
]

const signupConfig = {
	signups: {
		label: 'Sign-ups',
		color: 'hsl(var(--primary-500))',
	},
	label: {
		color: 'hsl(var(--foreground))',
	},
} satisfies SignupChartConfig

export function SignUpTrendsBarChart(): JSX.Element {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign-up Trends</CardTitle>
				<CardDescription>Last 6 weeks</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={signupConfig}>
					<BarChart
						data={signupData}
						layout="vertical"
						margin={{ top: 16, right: 16, bottom: 16, left: 0 }}
						barCategoryGap="30%"
					>
						<CartesianGrid
							horizontal={false}
							vertical={true}
							stroke="hsl(var(--chart-grid))"
						/>

						<YAxis
							dataKey="week"
							type="category"
							axisLine={false}
							tickLine={false}
							tickMargin={12}
							tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
						/>

						<XAxis
							dataKey="signups"
							type="number"
							axisLine={false}
							tickLine={false}
							tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
						/>

						<ChartTooltip
							cursor={{ fill: 'rgba(0,0,0,0.05)' }}
							content={
								<ChartTooltipContent
									indicator="dot"
									wrapperStyle={{
										backgroundColor: 'hsl(var(--chart-tooltip-bg))',
										color: 'hsl(var(--chart-tooltip-fg))',
									}}
								/>
							}
						/>

						<Bar
							dataKey="signups"
							layout="vertical"
							fill={signupConfig.signups.color}
							radius={[4, 4, 4, 4]}
						>
							<LabelList
								dataKey="week"
								position="insideLeft"
								offset={8}
								className="fill-[hsl(var(--background))]"
								fontSize={12}
							/>

							<LabelList
								dataKey="signups"
								position="right"
								offset={8}
								className="fill-[hsl(var(--foreground))]"
								fontSize={12}
							/>
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
				<div className="flex items-center gap-1">
					<CalendarDays className="h-4 w-4" />
					Weekly data
				</div>
				<div>Updated in real-time</div>
			</CardFooter>
		</Card>
	)
}
