'use client'

import * as React from 'react'
import type { ChartConfig } from '~/components/base/chart'
import { useIsMobile } from '~/hooks/use-mobile'
import type { ChartDataPoint } from '~/lib/types/dashboard'
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
	const [timeRange, setTimeRange] = React.useState('30d')

	React.useEffect(() => {
		if (isMobile) {
			setTimeRange('7d')
		}
	}, [isMobile])

	const filteredData = React.useMemo(() => {
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
