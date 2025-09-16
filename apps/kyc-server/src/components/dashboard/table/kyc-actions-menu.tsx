import {
	HistoryIcon,
	MoreVerticalIcon,
	RefreshCwIcon,
	ShieldCheckIcon,
	UserCheckIcon,
	UserIcon,
	XIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '~/components/base/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { useKycActions } from '~/hooks/use-kyc-actions'
import type { KycRecord } from '~/lib/types/dashboard'

interface KycActionsMenuProps {
	record: KycRecord
	onStatusUpdate?: () => void
	onReview?: (userId: string) => void
}

export function KycActionsMenu({
	record,
	onStatusUpdate,
	onReview,
}: KycActionsMenuProps) {
	const { updateKycStatus, isUpdating, error } = useKycActions()

	const handleStatusUpdate = async (newStatus: 'approved' | 'rejected' | 'pending') => {
		try {
			const success = await updateKycStatus({
				recordId: record.id,  // Use the primary key instead of userId
				userId: record.userId,
				status: newStatus,
			})

			if (!success) {
				const errorMessage = error || 'Failed to update KYC status'
				toast.error(`Update failed: ${errorMessage}`, {
					description: `Could not update status to ${newStatus} for ${record.displayName || record.email || record.userId}`,
				})
				return
			}

			toast.success(`Status updated to ${newStatus}`, {
				description: `Successfully updated KYC status for ${record.displayName || record.email || record.userId}`,
			})

			if (onStatusUpdate) {
				onStatusUpdate()
			}
		} catch (err) {
			const errorDetails = err instanceof Error ? err.message : 'Unknown error occurred'
			toast.error(`Update failed: ${errorDetails}`, {
				description: `Could not update status to ${newStatus} for ${record.displayName || record.email || record.userId}`,
			})
			console.error('KYC status update error:', err)
		}
	}

	const handleRequestReupload = async () => {
		// Guard against duplicate requests when already pending
		if (record.status === 'pending') {
			return
		}

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
					aria-label={`Actions for ${record.displayName || record.email || record.userId}`}
				>
					<MoreVerticalIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => onReview?.(record.userId)}
					disabled={isUpdating}
				>
					<UserCheckIcon className="mr-2 size-4" />
					Review KYC
				</DropdownMenuItem>
				{record.status !== 'approved' && record.status !== 'verified' && (
					<DropdownMenuItem
						className="text-green-600"
						disabled={isUpdating}
						onClick={() => handleStatusUpdate('approved')}
					>
						<ShieldCheckIcon className="mr-2 size-4" />
						{isUpdating ? 'Loading...' : 'Approve'}
					</DropdownMenuItem>
				)}
				{record.status !== 'rejected' && record.status !== 'verified' && (
					<DropdownMenuItem
						className="text-red-600"
						disabled={isUpdating}
						onClick={() => handleStatusUpdate('rejected')}
					>
						<XIcon className="mr-2 size-4" />
						{isUpdating ? 'Loading...' : 'Reject'}
					</DropdownMenuItem>
				)}
				{(record.status === 'approved' || record.status === 'rejected') && record.status !== 'verified' && record.status !== 'pending' && (
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
				<DropdownMenuItem 
					disabled 
					aria-disabled="true"
					title="Profile view feature coming soon"
				>
					<UserIcon className="mr-2 size-4" />
					View Profile
					<span className="ml-auto text-xs text-muted-foreground">(Coming soon)</span>
				</DropdownMenuItem>
				<DropdownMenuItem 
					disabled 
					aria-disabled="true"
					title="History view feature coming soon"
				>
					<HistoryIcon className="mr-2 size-4" />
					View History
					<span className="ml-auto text-xs text-muted-foreground">(Coming soon)</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}