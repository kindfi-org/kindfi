'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ChartConfig } from '~/components/base/chart'
import { useIsMobile } from '~/hooks/use-mobile'
import type { ChartDataPoint, TimeRange } from '~/lib/types/dashboard'
import { filterDataByTimeRange } from '~/utils/chart'

export const chartConfig = {
	signups: {
		label: 'New Signups',
	},
	basic: {
		label: 'Basic KYC',
		color: 'hsl(var(--chart-1))',
	},
	enhanced: {
		label: 'Enhanced KYC',
		color: 'hsl(var(--chart-2))',
	},
} satisfies ChartConfig

export function useSignupChartConfig(data: ChartDataPoint[]) {
	const isMobile = useIsMobile()
	const [timeRange, setTimeRange] = useState<TimeRange>('30d')

	useEffect(() => {
		if (isMobile) {
			setTimeRange('7d')
		}
	}, [isMobile])

	const filteredData = useMemo(() => {
		if (!data) return []
		return filterDataByTimeRange(data, timeRange)
	}, [data, timeRange])

	return {
		chartConfig,
		timeRange,
		setTimeRange,
		filteredData,
		isMobile,
	}
}
