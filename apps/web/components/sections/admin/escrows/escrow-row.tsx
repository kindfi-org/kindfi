'use client'

import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, ChevronDown, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card } from '~/components/base/card'
import { formatCurrency } from '~/components/sections/admin/admin-overview/formatters'
import { AdminStatusBadge } from '~/components/sections/admin/shared/admin-status-badge'
import { TruncatedId } from '~/components/sections/admin/shared/truncated-id'
import { useStellarNetworkConfig } from '~/hooks/contexts/stellar-network.context'
import { projectManageSectionHref } from '~/lib/admin/project-actions'
import type { AdminEscrowListItem } from '~/lib/queries/admin/get-admin-escrows'
import { formatHumanPlatformFee } from '~/lib/utils/escrow/platform-fee'
import { getStellarExplorerUrl } from '~/lib/utils/escrow/stellar-explorer'
import { EscrowDetailExpand } from './escrow-detail-expand'

const HEALTH_LABELS: Record<string, string> = {
	missing_association: 'Missing DB association',
	orphaned_project: 'Orphaned escrow',
}

interface EscrowRowProps {
	escrow: AdminEscrowListItem
	/** Current admin URL (path + search) used as the back-link target. */
	from: string
	onSynced: () => void
}

export function EscrowRow({ escrow, from, onSynced }: EscrowRowProps) {
	const [expanded, setExpanded] = useState(false)
	const { networkId } = useStellarNetworkConfig()
	const explorerUrl = getStellarExplorerUrl(escrow.contractId, networkId)

	const manageHref = escrow.project?.slug
		? `${projectManageSectionHref('escrow-manage', escrow.project.slug)}?from=${encodeURIComponent(from)}`
		: null

	return (
		<Card className={escrow.health.healthy ? undefined : 'border-amber-400'}>
			<div className="flex flex-col gap-3 p-4">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div className="flex min-w-0 items-center gap-3">
						<div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
							{escrow.project?.imageUrl ? (
								<Image
									src={escrow.project.imageUrl}
									alt={`${escrow.project.title} cover image`}
									fill
									className="object-cover"
									sizes="48px"
									loading="lazy"
								/>
							) : (
								<div
									aria-hidden="true"
									className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 text-lg font-semibold text-slate-600"
								>
									{(escrow.project?.title ?? 'E').slice(0, 1).toUpperCase()}
								</div>
							)}
						</div>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								{escrow.project ? (
									<>
										<h3 className="truncate font-semibold">{escrow.project.title}</h3>
										<AdminStatusBadge kind="project" status={escrow.project.status} />
									</>
								) : (
									<h3 className="font-semibold text-muted-foreground">No linked project</h3>
								)}
								<AdminStatusBadge kind="escrow" status={escrow.state ?? 'NEW'} />
								{escrow.type ? <Badge variant="secondary">{escrow.type}</Badge> : null}
							</div>
							<p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
								{escrow.project?.slug ? <span>/projects/{escrow.project.slug}</span> : null}
								<span aria-hidden="true">·</span>
								<span>Engagement {escrow.engagementId}</span>
							</p>
						</div>
					</div>

					<div className="flex shrink-0 flex-wrap items-center gap-2">
						{escrow.project?.slug ? (
							<Button asChild variant="ghost" size="sm">
								<Link href={`/projects/${escrow.project.slug}`}>View project</Link>
							</Button>
						) : null}
						<Button asChild variant="ghost" size="sm">
							<a href={explorerUrl} target="_blank" rel="noopener noreferrer">
								Explorer
								<ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
								<span className="sr-only">(opens Stellar Explorer in a new tab)</span>
							</a>
						</Button>
						{manageHref ? (
							<Button asChild variant="outline" size="sm">
								<Link href={manageHref}>Manage escrow</Link>
							</Button>
						) : null}
					</div>
				</div>

				{!escrow.health.healthy ? (
					<div
						role="alert"
						className="flex flex-wrap items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
					>
						<AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
						{escrow.health.issues.map((issue) => (
							<span key={issue} className="font-medium">
								{HEALTH_LABELS[issue] ?? issue}
							</span>
						))}
					</div>
				) : null}

				<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
					<TruncatedId value={escrow.contractId} copyLabel="Copy contract address" />
					<span>Amount {formatCurrency(escrow.amount)}</span>
					<span>Fee {formatHumanPlatformFee(escrow.platformFee)}</span>
					{escrow.releaseCount > 0 ? (
						<span>
							{escrow.releaseCount} {escrow.releaseCount === 1 ? 'release' : 'releases'}
						</span>
					) : null}
					{escrow.createdAt ? (
						<span>
							Created{' '}
							<time dateTime={escrow.createdAt}>
								{formatDistanceToNow(new Date(escrow.createdAt))} ago
							</time>
						</span>
					) : null}
					{escrow.updatedAt ? (
						<span>
							Updated{' '}
							<time dateTime={escrow.updatedAt}>
								{formatDistanceToNow(new Date(escrow.updatedAt))} ago
							</time>
						</span>
					) : null}
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="ml-auto"
						onClick={() => setExpanded((current) => !current)}
						aria-expanded={expanded}
					>
						{expanded ? 'Hide detail' : 'On-chain detail'}
						<ChevronDown
							className={`ml-1 h-4 w-4 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}
							aria-hidden="true"
						/>
					</Button>
				</div>
			</div>

			{expanded ? <EscrowDetailExpand escrow={escrow} onSynced={onSynced} /> : null}
		</Card>
	)
}
