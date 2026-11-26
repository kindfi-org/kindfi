'use client'

import { formatDistanceToNow } from 'date-fns'
import { Wallet } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { UserAvatar } from '~/components/base/user-avatar'
import { AdminStatusBadge } from '~/components/sections/admin/shared/admin-status-badge'
import { CopyButton } from '~/components/sections/admin/shared/copy-button'
import { TruncatedId } from '~/components/sections/admin/shared/truncated-id'
import type { AdminUserListItem } from '~/lib/queries/admin/get-admin-users'

const PROVIDER_LABELS: Record<string, string> = {
	legacy_passkey: 'Passkey',
	pollar: 'Pollar',
}

interface UserRowProps {
	user: AdminUserListItem
}

export function UserRow({ user }: UserRowProps) {
	const name = user.displayName || user.email || 'Unnamed user'

	return (
		<Card>
			<div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-3">
					<UserAvatar src={user.imageUrl ?? undefined} alt={`${name} avatar`} name={name} />
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="truncate font-semibold">{name}</h3>
							{user.role ? <AdminStatusBadge kind="role" status={user.role} /> : null}
							<AdminStatusBadge kind="kyc" status={user.kyc.status} />
							{user.onboardingProvider ? (
								<Badge variant="secondary">
									{PROVIDER_LABELS[user.onboardingProvider] ?? user.onboardingProvider}
								</Badge>
							) : null}
						</div>
						<p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
							{user.email ? <span className="truncate">{user.email}</span> : null}
							{user.createdAt ? (
								<>
									<span aria-hidden="true">·</span>
									<span>
										Joined{' '}
										<time dateTime={user.createdAt}>
											{formatDistanceToNow(new Date(user.createdAt))} ago
										</time>
									</span>
								</>
							) : null}
						</p>
						<div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
							{user.pollarWalletAddress ? (
								<span className="inline-flex items-center gap-1">
									<Wallet className="h-3.5 w-3.5" aria-hidden="true" />
									Pollar wallet
									<TruncatedId value={user.pollarWalletAddress} />
								</span>
							) : null}
							{user.externalWalletAddress ? (
								<span className="inline-flex items-center gap-1">
									<Wallet className="h-3.5 w-3.5" aria-hidden="true" />
									External wallet
									<TruncatedId value={user.externalWalletAddress} />
								</span>
							) : null}
							{!user.pollarWalletAddress && !user.externalWalletAddress ? (
								<span>No wallet connected</span>
							) : null}
						</div>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1">
					<CopyButton value={user.id} label={`Copy user ID for ${name}`} />
					{user.slug ? (
						<Button asChild variant="outline" size="sm">
							<Link href={`/u/${user.slug}`}>View profile</Link>
						</Button>
					) : null}
				</div>
			</div>
		</Card>
	)
}
