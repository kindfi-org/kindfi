import {
	MoreVerticalIcon,
	RefreshCwIcon,
	ShieldCheckIcon,
	UserCheckIcon,
	XIcon,
} from 'lucide-react'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { useKycActions } from '~/hooks/use-kyc-actions'
import type { UserData } from './user-table-columns'

interface UserActionsMenuProps {
	user: UserData
	onStatusUpdate?: () => void
}

export function UserActionsMenu({
	user,
	onStatusUpdate,
}: UserActionsMenuProps) {
	const { updateKycStatus, isUpdating } = useKycActions()

	const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'pending') => {
		const success = await updateKycStatus({
			recordId: user.id,  // Use the primary key instead of user_id
			userId: user.user_id,
			status: newStatus,
		})

		if (success && onStatusUpdate) {
			onStatusUpdate()
		}
	}

	const handleRequestReupload = async () => {
		// Reset status to pending to request reupload
		await handleStatusUpdate('pending')
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
					size="icon"
					disabled={isUpdating}
					aria-label={`Actions for ${user.display_name || user.email || user.user_id}`}
				>
					<MoreVerticalIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem>
					<UserCheckIcon className="mr-2 size-4" />
					Review KYC
				</DropdownMenuItem>
				{user.status !== 'approved' && (
					<DropdownMenuItem
						className="text-green-600"
						disabled={isUpdating}
						onClick={() => handleStatusUpdate('approved')}
					>
						<ShieldCheckIcon className="mr-2 size-4" />
						{isUpdating ? 'Loading...' : 'Approve'}
					</DropdownMenuItem>
				)}
				{user.status !== 'rejected' && (
					<DropdownMenuItem
						className="text-red-600"
						disabled={isUpdating}
						onClick={() => handleStatusUpdate('rejected')}
					>
						<XIcon className="mr-2 size-4" />
						{isUpdating ? 'Loading...' : 'Reject'}
					</DropdownMenuItem>
				)}
				{(user.status === 'approved' || user.status === 'rejected') && (
					<DropdownMenuItem
						className="text-orange-600"
						disabled={isUpdating}
						onClick={handleRequestReupload}
					>
						<RefreshCwIcon className="mr-2 size-4" />
						{isUpdating ? 'Loading...' : 'Request reupload'}
					</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem>View Profile</DropdownMenuItem>
				<DropdownMenuItem>View History</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
