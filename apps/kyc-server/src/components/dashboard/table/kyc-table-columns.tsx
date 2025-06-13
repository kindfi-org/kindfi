import type { ColumnDef } from '@tanstack/react-table'
import { MoreVerticalIcon, ShieldCheckIcon, UserCheckIcon } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Checkbox } from '~/components/base/checkbox'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { DragHandle } from '~/components/dashboard/table/drag-handle'
import { KycDetailsSheet } from '~/components/dashboard/table/kyc-details-sheet'
import type { KycRecord } from '~/lib/types/dashboard'
import { getStatusColor, getStatusIcon } from '~/utils/table'

export const kycColumns: ColumnDef<KycRecord>[] = [
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
					aria-label={`Select row for ${row.original.user_id}`}
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'user_id',
		header: 'User ID',
		cell: ({ row }) => {
			return <KycDetailsSheet item={row.original} />
		},
		enableHiding: false,
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<Badge
				variant="outline"
				className={`flex gap-1 px-1.5 [&_svg]:size-3 ${getStatusColor(row.original.status)}`}
			>
				{getStatusIcon(row.original.status)}
				{row.original.status.charAt(0).toUpperCase() +
					row.original.status.slice(1)}
			</Badge>
		),
	},
	{
		accessorKey: 'verification_level',
		header: 'Verification Level',
		cell: ({ row }) => (
			<div className="w-32">
				<Badge
					variant="outline"
					className={`px-1.5 ${row.original.verification_level === 'enhanced' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}
				>
					{row.original.verification_level === 'enhanced' ? (
						<ShieldCheckIcon className="mr-1 size-3" aria-hidden="true" />
					) : (
						<UserCheckIcon className="mr-1 size-3" aria-hidden="true" />
					)}
					{row.original.verification_level.charAt(0).toUpperCase() +
						row.original.verification_level.slice(1)}
				</Badge>
			</div>
		),
	},
	{
		accessorKey: 'created_at',
		header: 'Created',
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{new Date(row.original.created_at).toLocaleDateString()}
			</div>
		),
	},
	{
		accessorKey: 'updated_at',
		header: 'Updated',
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{new Date(row.original.updated_at).toLocaleDateString()}
			</div>
		),
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
						size="icon"
						aria-label={`Actions for ${row.original.user_id}`}
					>
						<MoreVerticalIcon className="size-4" aria-hidden="true" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-32">
					<DropdownMenuItem>Review</DropdownMenuItem>
					<DropdownMenuItem>Approve</DropdownMenuItem>
					<DropdownMenuItem>Reject</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem>View Details</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
]
