import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

export type CategoryOption =
	| 'all'
	| 'environment'
	| 'education'
	| 'healthcare'
	| 'social'
	| 'animal'

interface CategorySelectProps {
	value: CategoryOption
	onChange: (value: CategoryOption) => void
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-[180px] focus:outline-none focus:border-blue-500">
				<SelectValue placeholder="All Categories" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Categories</SelectItem>
				<SelectItem value="environment">Environment</SelectItem>
				<SelectItem value="education">Education</SelectItem>
				<SelectItem value="healthcare">Healthcare</SelectItem>
				<SelectItem value="social">Social Welfare</SelectItem>
				<SelectItem value="animal">Animal Protection</SelectItem>
			</SelectContent>
		</Select>
	)
}
