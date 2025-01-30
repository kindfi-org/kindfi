'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'

interface SortingControlsProps {
	value: string
	onChange: (value: string) => void
}

export function SortingControls({ value, onChange }: SortingControlsProps) {
	return (
		<div className="flex items-center gap-4">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" className="gap-2">
						Popular Searches
						<ChevronDown className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={() => onChange('popular')}>
						Popular Searches
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onChange('recent')}>
						Most Recent
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => onChange('funded')}>
						Most Funded
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
