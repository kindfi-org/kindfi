'use client'

import React from 'react'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'
import type { LegendProps, TooltipProps } from 'recharts'

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

import type { KycStatusRow } from '~/lib/types/kyc/kyc-table-types'

// ———————————————————————————————————————————————————————————————————————————
// 1. KYC data shape
// ———————————————————————————————————————————————————————————————————————————

const kycData: KycStatusRow[] = [
	{ id: '1', user: 'alice', status: 'approved', requestedAt: '2025-05-20' },
	{ id: '2', user: 'bob', status: 'pending', requestedAt: '2025-05-28' },
	{ id: '3', user: 'charlie', status: 'rejected', requestedAt: '2025-05-15' },
	{ id: '4', user: 'diana', status: 'approved', requestedAt: '2025-05-25' },
	{ id: '5', user: 'eve', status: 'pending', requestedAt: '2025-05-30' },
]

// ———————————————————————————————————————————————————————————————————————————
// 2. Status count
// ———————————————————————————————————————————————————————————————————————————
type StatusCount = {
	name: string
	value: number
	color: string
	icon: string
	total?: number
}

function computeStatusCounts(data: KycStatusRow[]): StatusCount[] {
	const counts = {
		approved: 0,
		pending: 0,
		rejected: 0,
	}

	for (const row of data) {
		counts[row.status]++
	}

	return [
		{
			name: 'Approved',
			value: counts.approved,
			color: 'hsl(var(--primary))',
			icon: '✓',
		},
		{
			name: 'Pending',
			value: counts.pending,
			color: 'hsl(var(--secondary-300))',
			icon: '⏳',
		},
		{
			name: 'Rejected',
			value: counts.rejected,
			color: 'hsl(var(--destructive))',
			icon: '✗',
		},
	]
}

// ———————————————————————————————————————————————————————————————————————————
// 3. Custom tooltip
// ———————————————————————————————————————————————————————————————————————————
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
	active,
	payload,
}) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload as StatusCount
		const percentage = ((data.value / (data.total || 1)) * 100).toFixed(1)

		return (
			<div className="bg-card border border-border rounded-lg shadow-lg p-3">
				<div className="flex items-center gap-2 mb-1">
					<div
						className="w-3 h-3 rounded-full"
						style={{ backgroundColor: data.color }}
					/>
					<span className="font-medium text-card-foreground">{data.name}</span>
				</div>
				<div className="text-sm text-muted-foreground">
					<div>
						Count:{' '}
						<span className="font-medium text-card-foreground">
							{data.value}
						</span>
					</div>
					<div>
						Percentage:{' '}
						<span className="font-medium text-card-foreground">
							{percentage}%
						</span>
					</div>
				</div>
			</div>
		)
	}
	return null
}

// ———————————————————————————————————————————————————————————————————————————
// 4. Custom legend with proper type check
// ———————————————————————————————————————————————————————————————————————————
function isStatusCount(obj: unknown): obj is StatusCount {
	return (
		typeof obj === 'object' &&
		obj !== null &&
		'name' in obj &&
		'color' in obj &&
		'icon' in obj &&
		'value' in obj &&
		typeof (obj as Record<string, unknown>).name === 'string' &&
		typeof (obj as Record<string, unknown>).color === 'string' &&
		typeof (obj as Record<string, unknown>).icon === 'string' &&
		typeof (obj as Record<string, unknown>).value === 'number'
	)
}

const CustomLegend: React.FC<LegendProps> = ({ payload }) => {
	if (!payload) return null

	return (
		<div className="flex justify-center gap-6 mt-4">
			{payload.map((entry) => {
				const raw = entry.payload

				if (isStatusCount(raw)) {
					return (
						<div key={raw.name} className="flex items-center gap-2">
							<div
								className="w-3 h-3 rounded-full shadow-sm"
								style={{ backgroundColor: raw.color }}
							/>
							<span className="text-sm font-medium text-card-foreground">
								{raw.icon} {entry.value}
							</span>
							<span className="text-xs text-muted-foreground ml-1">
								({raw.value})
							</span>
						</div>
					)
				}

				return null
			})}
		</div>
	)
}

// ———————————————————————————————————————————————————————————————————————————
// 5. Main component
// ———————————————————————————————————————————————————————————————————————————
export function KycStatusPieChart() {
	const statusCounts = React.useMemo(() => {
		const counts = computeStatusCounts(kycData)
		const total = counts.reduce((sum, item) => sum + item.value, 0)
		return counts.map((item) => ({ ...item, total }))
	}, [])

	const totalRequests = statusCounts.reduce((sum, item) => sum + item.value, 0)

	return (
		<Card className="shadow-sm border-border/50">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-xl font-semibold text-card-foreground">
							KYC Status Overview
						</CardTitle>
						<CardDescription className="text-muted-foreground mt-1">
							Distribution of verification requests
						</CardDescription>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-card-foreground">
							{totalRequests}
						</div>
						<div className="text-xs text-muted-foreground uppercase tracking-wide">
							Total Requests
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				<div className="h-80 relative">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<defs>
								<filter
									id="shadow"
									x="-50%"
									y="-50%"
									width="200%"
									height="200%"
								>
									<feDropShadow
										dx="0"
										dy="1"
										stdDeviation="2"
										floodOpacity="0.1"
									/>
								</filter>
							</defs>

							<Pie
								data={statusCounts}
								dataKey="value"
								nameKey="name"
								cx="50%"
								cy="45%"
								innerRadius="45%"
								outerRadius="75%"
								paddingAngle={2}
								strokeWidth={2}
								stroke="hsl(var(--background))"
								filter="url(#shadow)"
								label={({ percent }) => {
									if (typeof percent !== 'number') return ''
									const percentage = (percent * 100).toFixed(0)
									return percentage !== '0' ? `${percentage}%` : ''
								}}
								labelLine={false}
								fontSize={12}
								fontWeight="600"
							>
								{statusCounts.map((entry) => (
									<Cell
										key={`slice-${entry.name}`}
										fill={entry.color}
										className="hover:opacity-80 transition-opacity cursor-pointer"
									/>
								))}
							</Pie>

							<Tooltip content={<CustomTooltip />} />
							<Legend content={<CustomLegend />} />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Breakdown cards */}
				<div className="grid grid-cols-3 gap-3 mt-6">
					{statusCounts.map((status) => {
						const percentage = ((status.value / totalRequests) * 100).toFixed(1)
						return (
							<div
								key={status.name}
								className="rounded-lg p-3 text-center transition-all hover:shadow-sm"
								style={{
									backgroundColor: `${status.color}15`,
									border: `1px solid ${status.color}30`,
								}}
							>
								<div
									className="text-lg font-bold"
									style={{ color: status.color }}
								>
									{status.value}
								</div>
								<div className="text-xs text-muted-foreground mt-1">
									{status.name}
								</div>
								<div className="text-xs font-medium text-card-foreground mt-1">
									{percentage}%
								</div>
							</div>
						)
					})}
				</div>
			</CardContent>
		</Card>
	)
}
