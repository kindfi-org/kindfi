import type { ChartDataPoint } from '~/lib/types/dashboard'

export function formatDateTick(value: string): string {
	const date = new Date(value)
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
	})
}

export function filterDataByTimeRange(
	data: ChartDataPoint[],
	timeRange: string,
): ChartDataPoint[] {
	const referenceDate = new Date('2024-06-30')
	let daysToSubtract = 90

	if (timeRange === '30d') {
		daysToSubtract = 30
	} else if (timeRange === '7d') {
		daysToSubtract = 7
	}

	const startDate = new Date(referenceDate)
	startDate.setDate(startDate.getDate() - daysToSubtract)

	return data.filter((item) => {
		const date = new Date(item.date)
		return date >= startDate
	})
}
