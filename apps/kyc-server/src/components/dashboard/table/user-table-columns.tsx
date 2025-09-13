import type { ColumnDef } from '@tanstack/react-table'
import { ShieldCheckIcon, UserCheckIcon, UserIcon } from 'lucide-react'

import { Badge } from '~/components/base/badge'
import { Checkbox } from '~/components/base/checkbox'
import { DragHandle } from '~/components/dashboard/table/drag-handle'
import { UserActionsMenu } from '~/components/dashboard/table/user-actions-menu'
import { UserDetailsSheet } from '~/components/dashboard/table/user-details-sheet'
import { getStatusColor, getStatusIcon } from '~/utils/table'

type UserData = any

export const createUserTableColumns = (onStatusUpdate?: () => void): ColumnDef<UserData>[] => [
	{
		id: 'drag',
		header: () => null,
		cell: ({ row }) => <DragHandle id={row.original.id} />,
	},
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'user_id',
		header: 'User ID',
		cell: ({ row }) => {
			return <UserDetailsSheet item={row.original} />
		},
		enableHiding: false,
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => (
			<span className="max-w-[200px] truncate text-sm">
				{row.original.email || 'N/A'}
			</span>
		),
	},
	{
		accessorKey: 'display_name',
		header: 'Display Name',
		cell: ({ row }) => (
			<span className="flex items-center gap-2">
				<UserIcon className="size-4" />
				{row.original.display_name || 'Anonymous'}
			</span>
		),
	},
	{
		accessorKey: 'status',
		header: 'KYC Status',
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
		cell: ({ row }) => {
			const isEnhanced = row.original.verification_level === 'enhanced'
			return (
				<Badge variant="outline" className={isEnhanced ? 'text-blue-600' : ''}>
					{isEnhanced ? <ShieldCheckIcon className="mr-1 size-3" /> : <UserCheckIcon className="mr-1 size-3" />}
					{row.original.verification_level}
				</Badge>
			)
		},
	},
	{
		accessorKey: 'created_at',
		header: 'Created',
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{new Date(row.original.created_at).toLocaleDateString()}
			</span>
		),
	},
	{
		accessorKey: 'updated_at',
		header: 'Last Updated',
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{new Date(row.original.updated_at).toLocaleDateString()}
			</span>
		),
	},
	{
		id: 'actions',
		header: () => <div className="text-center">Actions</div>,
		cell: ({ row }) => (
			<UserActionsMenu 
				user={row.original} 
				onStatusUpdate={onStatusUpdate}
			/>
		),
	},
]

export const userTableColumns = createUserTableColumns()