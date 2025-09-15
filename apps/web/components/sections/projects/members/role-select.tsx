'use client'

import type { Enums } from '@services/supabase'
import { Check, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'

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
import { RoleBadge } from './role-badge'

interface RoleSelectProps {
	role: Enums<'project_member_role'>
	onRoleChange: (role: Enums<'project_member_role'>) => void
	disabled?: boolean
	placeholder?: string
	className?: string
	showDescription?: boolean
	descriptions?: Partial<Record<Enums<'project_member_role'>, string>>
}

export function RoleSelect({
	role,
	onRoleChange,
	disabled = false,
	placeholder = 'Select role...',
	className,
	showDescription = false,
	descriptions,
}: RoleSelectProps) {
	const [open, setOpen] = useState(false)
	const listboxId = useId()

	const ariaLabel = role ? `Change role, current: ${role}` : 'Select role'

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					aria-label={ariaLabel}
					aria-haspopup="listbox"
					aria-expanded={open}
					aria-controls={open ? listboxId : undefined}
					className={cn('justify-between bg-white border-green-600', className)}
					disabled={disabled}
				>
					{role ? (
						<RoleBadge role={role} />
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
				<Command id={listboxId} className="bg-white" role="listbox">
					<CommandEmpty>No role found.</CommandEmpty>
					<CommandList>
						<CommandGroup>
							{(
								Object.keys(memberRole) as Array<Enums<'project_member_role'>>
							).map((roleKey) => (
								<CommandItem
									key={roleKey}
									value={roleKey}
									role="option"
									aria-selected={role === roleKey}
									onSelect={() => {
										onRoleChange(roleKey as Enums<'project_member_role'>)
										setOpen(false)
									}}
									className="flex items-center justify-between p-3"
								>
									<div className="flex flex-col gap-1">
										<div className="flex items-center gap-2">
											<RoleBadge role={roleKey} />

											{role === roleKey && (
												<Check aria-hidden className="h-4 w-4 text-primary" />
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
