'use client'

import type { Enums } from '@services/supabase'
import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from '~/components/base/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/base/popover'
import { cn } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'

interface RoleSelectProps {
	value: Enums<'project_member_role'>
	onValueChange: (value: Enums<'project_member_role'>) => void
	disabled?: boolean
	placeholder?: string
	className?: string
	showDescription?: boolean
	descriptions?: Partial<Record<Enums<'project_member_role'>, string>>
}

export function RoleSelect({
	value,
	onValueChange,
	disabled = false,
	placeholder = 'Select role...',
	className,
	showDescription = false,
	descriptions,
}: RoleSelectProps) {
	const [open, setOpen] = useState(false)
	const selected = memberRole[value]

	const ariaLabel = value
		? `Change role, current: ${selected.label}`
		: 'Select role'

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-label={ariaLabel}
					aria-haspopup="listbox"
					aria-expanded={open}
					className={cn('justify-between bg-white border-green-600', className)}
					disabled={disabled}
				>
					{value ? (
						<Badge
							className={cn(
								'inline-flex items-center gap-1.5 px-2.5 py-1',
								'leading-none',
								selected.badgeClass,
							)}
						>
							<selected.icon
								className={cn('h-3.5 w-3.5', selected.iconClass)}
							/>
							{selected.label}
						</Badge>
					) : (
						<span className="text-muted-foreground">{placeholder}</span>
					)}
					<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="w-[--radix-popover-trigger-width] p-0"
				align="start"
			>
				<Command className="bg-white" role="listbox">
					<CommandEmpty>No role found.</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{Object.entries(memberRole).map(([roleKey, meta]) => (
								<CommandItem
									key={roleKey}
									value={roleKey}
									role="option"
									aria-selected={value === roleKey}
									onSelect={() => {
										onValueChange(roleKey as Enums<'project_member_role'>)
										setOpen(false)
									}}
									className="flex items-center justify-between p-3"
								>
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-2">
											<Badge
												className={cn(
													'inline-flex items-center gap-1.5 px-2.5 py-1 leading-none',
													meta.badgeClass,
												)}
											>
												<meta.icon
													className={cn('h-3.5 w-3.5', meta.iconClass)}
												/>
												{meta.label}
											</Badge>

											{value === roleKey && (
												<Check className="h-4 w-4 text-primary" />
											)}
										</div>

										{showDescription &&
											descriptions?.[
												roleKey as Enums<'project_member_role'>
											] && (
												<p className="text-sm text-muted-foreground">
													{
														descriptions[
															roleKey as Enums<'project_member_role'>
														]
													}
												</p>
											)}
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
