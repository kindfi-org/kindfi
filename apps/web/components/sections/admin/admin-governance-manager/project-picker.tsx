'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/base/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/base/popover'
import { cn } from '~/lib/utils'
import type { ProjectSummary } from './types'

interface ProjectPickerProps {
	projects: ProjectSummary[]
	selectedId: string
	onSelect: (project: ProjectSummary) => void
	disabled?: boolean
}

export const ProjectPicker = ({
	projects,
	selectedId,
	onSelect,
	disabled,
}: ProjectPickerProps) => {
	const [open, setOpen] = useState(false)
	const selected = projects.find((p) => p.id === selectedId)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={cn(
						'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background',
						'hover:bg-accent/40 focus:outline-none focus:ring-1 focus:ring-ring',
						'disabled:cursor-not-allowed disabled:opacity-50',
						!selected && 'text-muted-foreground',
					)}
				>
					<span className="truncate">
						{selected ? selected.title : 'Select a project…'}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[--radix-popover-trigger-width] p-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder="Search projects…" className="h-9" />
					<CommandList>
						<CommandEmpty>No projects found.</CommandEmpty>
						<CommandGroup>
							{projects.map((project) => (
								<CommandItem
									key={project.id}
									value={`${project.title} ${project.slug}`}
									onSelect={() => {
										onSelect(project)
										setOpen(false)
									}}
									className="gap-2"
								>
									{project.image_url ? (
										<Image
											src={project.image_url}
											alt=""
											width={24}
											height={24}
											className="h-6 w-6 rounded object-cover shrink-0"
										/>
									) : (
										<div className="h-6 w-6 rounded bg-muted shrink-0" />
									)}
									<div className="flex-1 min-w-0">
										<span className="block truncate font-medium">
											{project.title}
										</span>
										{project.category && (
											<span className="block text-xs text-muted-foreground truncate">
												{project.category.name} · /{project.slug}
											</span>
										)}
									</div>
									{selectedId === project.id && (
										<Check className="h-4 w-4 shrink-0 text-primary" />
									)}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
