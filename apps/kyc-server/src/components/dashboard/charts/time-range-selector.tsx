import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { ToggleGroup, ToggleGroupItem } from '~/components/base/toggle-group'
import { timeRanges } from '~/lib/constants/dashboard'
import type { TimeRange } from '~/lib/types/dashboard'

interface TimeRangeSelectorProps {
	timeRange: TimeRange
	onTimeRangeChange: (value: TimeRange) => void
}

export function TimeRangeSelector({
	timeRange,
	onTimeRangeChange,
}: TimeRangeSelectorProps) {
	return (
		<>
			<ToggleGroup
				type="single"
				value={timeRange}
				onValueChange={onTimeRangeChange}
				variant="outline"
				className="@[767px]/card:flex hidden"
				aria-label="Select time range"
			>
				{timeRanges.map((r) => (
					<ToggleGroupItem
						key={r.value}
						value={r.value}
						className="h-8 px-2.5"
						aria-label={r.label}
					>
						{r.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			<Select value={timeRange} onValueChange={onTimeRangeChange}>
				<SelectTrigger
					className="@[767px]/card:hidden flex w-40"
					aria-label="Select a time range"
				>
					<SelectValue placeholder="Last 3 months" />
				</SelectTrigger>
				<SelectContent className="rounded-xl">
					{timeRanges.map((r) => (
						<SelectItem key={r.value} value={r.value} className="rounded-lg">
							{r.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</>
	)
}
