'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

interface SearchBarProps {
	onSearch: (query: string) => void
}

export const SearchBar = ({ onSearch }: SearchBarProps) => {
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')

	// Debounce search input to avoid excessive filtering
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchQuery])

	// Pass the debounced query to parent component
	useEffect(() => {
		onSearch(debouncedQuery)
	}, [debouncedQuery, onSearch])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		onSearch(searchQuery)
	}

	return (
		<motion.form
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.4 }}
			onSubmit={handleSearch}
			className="w-full max-w-xl"
		>
			<div className="relative w-full">
				{/* Search Icon */}
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />

				{/* Search Input */}
				<Input
					type="text"
					placeholder="Search all resources..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-20 py-6 rounded-lg border-slate-200 text-sm placeholder:text-sm focus:border-primary focus:ring-primary"
					aria-label="Search resources"
				/>

				{/* Search Button Inside Input */}
				<Button
					type="submit"
					className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-black text-white text-sm font-medium p-5 rounded-md"
				>
					Search
				</Button>
			</div>
		</motion.form>
	)
}
