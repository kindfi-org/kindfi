import { Search } from 'lucide-react'
import { Input } from '~/components/base/input'

interface SearchBarProps {
	placeholder?: string
	onChange?: (value: string) => void
	className?: string
}

export function SearchBar({
	placeholder = 'Search...',
	onChange,
	className = '',
}: SearchBarProps) {
	return (
		<div className={`relative w-full sm:w-[300px] ${className}`}>
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				className="pl-9"
				placeholder={placeholder}
				onChange={(e) => onChange?.(e.target.value)}
			/>
		</div>
	)
}
