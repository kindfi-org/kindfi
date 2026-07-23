'use client'

import { Loader2, UserCog } from 'lucide-react'
import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/base/alert-dialog'
import { Button } from '~/components/base/button'
import { UserSearchPicker } from '~/components/shared/user-search-picker'
import type { SearchableUser } from '~/lib/schemas/user.schemas'

type ReplaceFounderDialogProps = {
	currentFounderId?: string
	currentFounderName?: string | null
	onReplace: (userId: string) => Promise<void>
	isPending?: boolean
}

export const ReplaceFounderDialog = ({
	currentFounderId,
	currentFounderName,
	onReplace,
	isPending = false,
}: ReplaceFounderDialogProps) => {
	const [open, setOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<SearchableUser | null>(null)

	const handleConfirm = async () => {
		if (!selectedUser) return
		await onReplace(selectedUser.id)
		setSelectedUser(null)
		setOpen(false)
	}

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen)
		if (!nextOpen) {
			setSelectedUser(null)
		}
	}

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="shrink-0 border-purple-200 hover:bg-purple-50"
					disabled={isPending}
				>
					<UserCog className="h-4 w-4 mr-1.5" aria-hidden="true" />
					Replace founder
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Replace foundation founder</AlertDialogTitle>
					<AlertDialogDescription>
						{currentFounderName
							? `Transfer founder ownership from ${currentFounderName} to a registered KindFi user.`
							: 'Assign a registered KindFi user as the foundation founder.'}{' '}
						The new founder will have full manage access for this foundation.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="py-2">
					<p className="text-sm font-medium mb-2">Select new founder</p>
					<UserSearchPicker
						selectedUser={selectedUser}
						onSelect={setSelectedUser}
						excludeUserIds={currentFounderId ? [currentFounderId] : []}
					/>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={(event) => {
							event.preventDefault()
							void handleConfirm()
						}}
						disabled={!selectedUser || isPending}
						className="bg-purple-600 hover:bg-purple-700"
					>
						{isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-1.5 animate-spin" aria-hidden="true" />
								Updating…
							</>
						) : (
							'Confirm replacement'
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
