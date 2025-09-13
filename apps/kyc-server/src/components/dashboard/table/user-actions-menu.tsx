import { MoreVerticalIcon, ShieldCheckIcon, UserCheckIcon, UserIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { useKycActions } from '~/hooks/use-kyc-actions'

interface UserActionsMenuProps {
	user: any  // TODO: should probably use proper types but this works for now
	onStatusUpdate?: () => void
}

export function UserActionsMenu({ user, onStatusUpdate }: UserActionsMenuProps) {
	const { updateKycStatus, isUpdating } = useKycActions()

	const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
		const success = await updateKycStatus({
			userId: user.user_id,
			status: newStatus,
		})

		if (success && onStatusUpdate) {
			onStatusUpdate()
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
					size="icon"
					disabled={isUpdating}
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
				<DropdownMenuSeparator />
				<DropdownMenuItem>View Profile</DropdownMenuItem>
				<DropdownMenuItem>View History</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}