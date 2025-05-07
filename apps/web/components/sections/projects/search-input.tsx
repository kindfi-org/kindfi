'use client'

import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'

interface SearchInputProps {
	onSearch: (query: string) => void
	placeholder?: string
}

export function SearchInput({
	onSearch,
	placeholder = 'Search projects...',
}: SearchInputProps) {
	const [query, setQuery] = useState('')

	// Debounce search to avoid too many re-renders
	useEffect(() => {
		const timer = setTimeout(() => {
			onSearch(query)
		}, 300)

		return () => clearTimeout(timer)
	}, [query, onSearch])

	const handleClear = () => {
		setQuery('')
		onSearch('')
	}

	return (
		<div className="relative w-full">
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
			<Input
				type="search"
				placeholder={placeholder}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="pl-10 pr-10 w-full gradient-border-btn"
				aria-label="Search projects"
			/>
			{query && (
				<Button
					variant="ghost"
					size="sm"
					className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
					onClick={handleClear}
					aria-label="Clear search"
				>
					<X className="h-4 w-4" aria-hidden="true" />
					<span className="sr-only">Clear search</span>
				</Button>
			)}
		</div>
	)
}
