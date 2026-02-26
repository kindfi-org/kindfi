'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Card, CardContent } from '~/components/base/card'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { getAllUsers } from '~/lib/queries/admin/get-all-users'
import { formatDistanceToNow } from '~/lib/utils/date-utils'

const SKELETON_KEYS = [
	'user-sk-1',
	'user-sk-2',
	'user-sk-3',
	'user-sk-4',
	'user-sk-5',
] as const

export function AdminUsersList() {
	const {
		data: users,
		isLoading,
		error,
	} = useSupabaseQuery('admin-users', (client) => getAllUsers(client), {})

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<div className="h-8 w-56 bg-muted animate-pulse rounded" />
					<div className="mt-2 h-4 w-72 bg-muted animate-pulse rounded" />
				</div>
				<div className="space-y-2">
					{SKELETON_KEYS.map((key) => (
						<div
							key={key}
							className="h-20 rounded-lg bg-muted/60 animate-pulse"
						/>
					))}
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="space-y-6">
				<AdminSectionHeader
					title="Users"
					description="View and manage all users on the platform"
				/>
				<Card className="border-destructive/50">
					<CardContent className="py-12 text-center">
						<p className="font-medium text-destructive">Error loading users.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Refresh the page or try again later.
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	const roleColors: Record<string, string> = {
		admin: 'bg-red-100 text-red-800',
		creator: 'bg-purple-100 text-purple-800',
		donor: 'bg-blue-100 text-blue-800',
		kinder: 'bg-green-200 text-green-800',
		kindler: 'bg-yellow-100 text-yellow-800',
		pending: 'bg-gray-100 text-gray-800',
	}

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Users"
				description="View and manage all users on the platform"
			/>

			<div className="space-y-2">
				{users?.map((user) => (
					<Card key={user.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4 flex-1">
									{user.imageUrl ? (
										<div className="relative h-12 w-12 overflow-hidden rounded-full">
											<Image
												src={user.imageUrl}
												alt={user.displayName || 'User'}
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div className="h-12 w-12 rounded-full bg-muted" />
									)}
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-1">
											<span className="font-semibold">
												{user.displayName || 'Anonymous'}
											</span>
											<Badge className={roleColors[user.role] || 'bg-gray-100'}>
												{user.role}
											</Badge>
										</div>
										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<span>{user.email}</span>
											<span>•</span>
											<span>
												Joined{' '}
												{user.createdAt
													? formatDistanceToNow(new Date(user.createdAt))
													: 'Unknown'}
											</span>
										</div>
									</div>
								</div>
								<div className="flex gap-2">
									{user.slug && (
										<Link
											href={`/u/${user.slug}`}
											className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
										>
											View Profile
										</Link>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{users?.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-muted-foreground">No users found.</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Users will appear here once they sign up.
						</p>
					</CardContent>
				</Card>
			) : null}
		</div>
	)
}
