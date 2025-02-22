import { Search } from 'lucide-react'

interface SearchBarProps {
	placeholder?: string
	onChange?: (value: string) => void
	className?: string
}

export function SearchBar({
	placeholder = 'Search resources...',
	onChange,
	className = '',
}: SearchBarProps) {
	return (
		<div className={`relative ${className}`}>
			<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
			<input
				type="text"
				className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
				placeholder={placeholder}
				onChange={(e) => onChange?.(e.target.value)}
			/>
		</div>
	)
}
