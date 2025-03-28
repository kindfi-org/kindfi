import {
	FlameIcon as Fire,
	Heart,
	Star,
	TrendingUpIcon as Trending,
} from 'lucide-react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import type { SortOption } from '~/hooks/use-projects-filter'
interface SortDropdownProps {
	value: SortOption
	onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
	return (
		<div className="flex items-center">
			<div className="relative">
				<Select defaultValue={value} onValueChange={onChange}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sort by" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="popular">
							<span className="flex items-center gap-2">
								<Trending className="h-4 w-4" />
								Popular Searches
							</span>
						</SelectItem>
						<SelectItem value="funding">
							<span className="flex items-center gap-2">
								<Star className="h-4 w-4" />
								Most Funded
							</span>
						</SelectItem>
						<SelectItem value="newest">
							<span className="flex items-center gap-2">
								<Fire className="h-4 w-4" />
								Newest
							</span>
						</SelectItem>
						<SelectItem value="supporters">
							<span className="flex items-center gap-2">
								<Heart className="h-4 w-4" />
								Most Supporters
							</span>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
