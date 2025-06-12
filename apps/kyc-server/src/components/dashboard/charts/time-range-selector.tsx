import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { ToggleGroup, ToggleGroupItem } from '~/components/base/toggle-group'

interface TimeRangeSelectorProps {
	timeRange: string
	onTimeRangeChange: (value: string) => void
	isMobile: boolean
}

export function TimeRangeSelector({
	timeRange,
	onTimeRangeChange,
	isMobile,
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
				<ToggleGroupItem
					value="90d"
					className="h-8 px-2.5"
					aria-label="Last 3 months"
				>
					Last 3 months
				</ToggleGroupItem>
				<ToggleGroupItem
					value="30d"
					className="h-8 px-2.5"
					aria-label="Last 30 days"
				>
					Last 30 days
				</ToggleGroupItem>
				<ToggleGroupItem
					value="7d"
					className="h-8 px-2.5"
					aria-label="Last 7 days"
				>
					Last 7 days
				</ToggleGroupItem>
			</ToggleGroup>

			<Select value={timeRange} onValueChange={onTimeRangeChange}>
				<SelectTrigger
					className="@[767px]/card:hidden flex w-40"
					aria-label="Select a time range"
				>
					<SelectValue placeholder="Last 3 months" />
				</SelectTrigger>
				<SelectContent className="rounded-xl">
					<SelectItem value="90d" className="rounded-lg">
						Last 3 months
					</SelectItem>
					<SelectItem value="30d" className="rounded-lg">
						Last 30 days
					</SelectItem>
					<SelectItem value="7d" className="rounded-lg">
						Last 7 days
					</SelectItem>
				</SelectContent>
			</Select>
		</>
	)
}
