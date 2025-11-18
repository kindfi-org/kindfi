import type { ColumnDef } from '@tanstack/react-table'
import { ShieldCheckIcon, UserCheckIcon } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Checkbox } from '~/components/base/checkbox'
import { DragHandle } from '~/components/dashboard/table/drag-handle'
import { KycActionsMenu } from '~/components/dashboard/table/kyc-actions-menu'
import { KycDetailsSheet } from '~/components/dashboard/table/kyc-details-sheet'
import { getStatusColor, getStatusIcon } from '~/lib/table'
import type { KycRecord } from '~/lib/types/dashboard'

// Create enhanced KYC table columns with actions support
export const createKycTableColumns = (
	onStatusUpdate?: () => void,
	onReview?: (userId: string) => void,
): ColumnDef<KycRecord>[] => [
	{
		id: 'drag',
		header: () => null,
		cell: ({ row }) => <DragHandle id={row.original.id} />,
	},
	{
		id: 'select',
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && 'indeterminate')
					}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label="Select all rows"
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label={`Select row for ${row.original.userId}`}
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'userId',
		header: 'User ID',
		cell: ({ row }) => {
			return <KycDetailsSheet item={row.original} />
		},
		enableHiding: false,
	},
	{
		accessorKey: 'displayName',
		header: 'Name',
		cell: ({ row }) => (
			<div className="flex items-center gap-2">
				<UserCheckIcon className="size-4 text-muted-foreground" />
				<span className="font-medium">
					{row.original.displayName || row.original.email || 'No name'}
				</span>
			</div>
		),
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{row.original.email || 'No email'}
			</div>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const status = row.original.status
			if (!status) {
				return (
					<Badge
						variant="outline"
						className="flex gap-1 px-1.5 text-muted-foreground"
					>
						<span>No KYC</span>
					</Badge>
				)
			}
			return (
				<Badge
					variant="outline"
					className={`flex gap-1 px-1.5 [&_svg]:size-3 ${getStatusColor(status)}`}
				>
					{getStatusIcon(status)}
					{status.charAt(0).toUpperCase() + status.slice(1)}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'verificationLevel',
		header: 'Verification Level',
		cell: ({ row }) => {
			const verificationLevel = row.original.verificationLevel
			if (!verificationLevel) {
				return (
					<div className="w-32">
						<Badge variant="outline" className="px-1.5 text-muted-foreground">
							<span>N/A</span>
						</Badge>
					</div>
				)
			}
			return (
				<div className="w-32">
					<Badge
						variant="outline"
						className={`px-1.5 ${verificationLevel === 'enhanced' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
					>
						{verificationLevel === 'enhanced' ? (
							<ShieldCheckIcon className="mr-1 size-3" aria-hidden="true" />
						) : (
							<UserCheckIcon className="mr-1 size-3" aria-hidden="true" />
						)}
						{verificationLevel.charAt(0).toUpperCase() +
							verificationLevel.slice(1)}
					</Badge>
				</div>
			)
		},
	},
	{
		accessorKey: 'createdAt',
		header: 'Created',
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{new Date(row.original.createdAt).toLocaleDateString()}
			</div>
		),
	},
	{
		accessorKey: 'updatedAt',
		header: 'Updated',
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{new Date(row.original.updatedAt).toLocaleDateString()}
			</div>
		),
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<KycActionsMenu
				record={row.original}
				onStatusUpdate={onStatusUpdate}
				onReview={onReview}
			/>
		),
	},
]

// Backward compatibility - export with the old name
export const kycColumns = createKycTableColumns()

// Export type for external use
export type { KycRecord }
