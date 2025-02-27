import { BookOpen, TrendingUp, Users } from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'

export type OptionSort = 'amount' | 'projects' | 'followers'

interface SortSelectProps {
	value: OptionSort
	onChange: (value: OptionSort) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-[180px] focus:outline-none focus:border-blue-500">
				<SelectValue placeholder="Sort by" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="amount">
					<span className="flex items-center">
						<TrendingUp className="h-4 w-4 mr-2" />
						Highest Amount
					</span>
				</SelectItem>
				<SelectItem value="projects">
					<span className="flex items-center">
						<BookOpen className="h-4 w-4 mr-2" />
						Most Projects
					</span>
				</SelectItem>
				<SelectItem value="followers">
					<span className="flex items-center">
						<Users className="h-4 w-4 mr-2" />
						Most Followed
					</span>
				</SelectItem>
			</SelectContent>
		</Select>
	)
}
