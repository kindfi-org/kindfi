'use client'

import { Check, ChevronsUpDown, Loader2, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/base/avatar'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/base/command'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/base/popover'
import type { SearchableUser } from '~/lib/schemas/user.schemas'
import { cn, getAvatarFallback } from '~/lib/utils'
import type { UserSearchPickerProps } from './user-search-picker.types'

export function UserSearchPicker({
	selectedUser,
	onSelect,
	disabled = false,
	excludeUserIds = [],
}: UserSearchPickerProps) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState('')
	const [users, setUsers] = useState<SearchableUser[]>([])
	const [isSearching, setIsSearching] = useState(false)
	const [searchError, setSearchError] = useState<string | null>(null)
	const excludedIdsKey = useMemo(() => excludeUserIds.join(','), [excludeUserIds])

	useEffect(() => {
		if (query.trim().length < 2) {
			setUsers([])
			setSearchError(null)
			return
		}

		const controller = new AbortController()
		const timeoutId = setTimeout(async () => {
			setIsSearching(true)
			setSearchError(null)
			try {
				const res = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`, {
					signal: controller.signal,
				})

				if (!res.ok) {
					let message = 'Failed to search users'
					try {
						const body = (await res.json()) as { error?: string }
						message = body.error ?? message
					} catch {
						// ignore parse errors
					}
					setUsers([])
					setSearchError(message)
					return
				}

				const data = (await res.json()) as { users: SearchableUser[] }
				const excluded = new Set(excludedIdsKey.split(',').filter(Boolean))
				setUsers(data.users.filter((user) => !excluded.has(user.id)))
			} catch (error) {
				if (error instanceof DOMException && error.name === 'AbortError') {
					return
				}
				setUsers([])
				setSearchError('Failed to search users')
			} finally {
				setIsSearching(false)
			}
		}, 300)

		return () => {
			clearTimeout(timeoutId)
			controller.abort()
		}
	}, [query, excludedIdsKey])

	const displayLabel = selectedUser
		? selectedUser.displayName || selectedUser.email || 'Selected user'
		: 'Search by name or email…'

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					disabled={disabled}
					className={cn(
						'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background',
						'hover:bg-accent/40 focus:outline-none focus:ring-1 focus:ring-ring',
						'disabled:cursor-not-allowed disabled:opacity-50',
						!selectedUser && 'text-muted-foreground',
					)}
				>
					<span className="flex items-center gap-2 truncate">
						{selectedUser ? (
							<Avatar className="h-6 w-6">
								<AvatarImage src={selectedUser.imageUrl ?? undefined} alt="" />
								<AvatarFallback className="text-xs">
									{getAvatarFallback(selectedUser.displayName || selectedUser.email || '')}
								</AvatarFallback>
							</Avatar>
						) : (
							<User className="h-4 w-4 shrink-0" aria-hidden="true" />
						)}
						<span className="truncate">{displayLabel}</span>
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search users…"
						className="h-9"
						value={query}
						onValueChange={setQuery}
					/>
					<CommandList>
						{isSearching ? (
							<div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
								<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
								Searching…
							</div>
						) : searchError ? (
							<CommandEmpty>{searchError}</CommandEmpty>
						) : query.trim().length < 2 ? (
							<CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
						) : users.length === 0 ? (
							<CommandEmpty>No users found.</CommandEmpty>
						) : (
							<CommandGroup>
								{users.map((user) => {
									const label = user.displayName || user.email || 'Anonymous'
									return (
										<CommandItem
											key={user.id}
											value={`${label} ${user.email ?? ''}`}
											onSelect={() => {
												onSelect(user)
												setOpen(false)
											}}
											className="gap-2"
										>
											<Avatar className="h-6 w-6 shrink-0">
												<AvatarImage src={user.imageUrl ?? undefined} alt="" />
												<AvatarFallback className="text-xs">
													{getAvatarFallback(label)}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<span className="block truncate font-medium">{label}</span>
												{user.email ? (
													<span className="block text-xs text-muted-foreground truncate">
														{user.email}
													</span>
												) : null}
											</div>
											{selectedUser?.id === user.id ? (
												<Check className="h-4 w-4 shrink-0 text-primary" />
											) : null}
										</CommandItem>
									)
								})}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
