'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Badge } from '~/components/base/badge'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { DonationForm, DonationNotices } from './components/donation-form'
import { EscrowContractInfo } from './components/escrow-contract-info'
import { FoundationLink } from './components/foundation-link'
import { ProjectProgressBar } from './components/project-progress-bar'
import { ProjectTagsPanel } from './components/project-tags-panel'
import { SidebarActions } from './components/sidebar-actions'
import { WalletStatusPanel } from './components/wallet-status-panel'
import { useProjectSidebar } from './hooks/use-project-sidebar'

interface ProjectSidebarProps {
	project: ProjectDetail
	projectSlug: string
}

export function ProjectSidebar({ project, projectSlug }: ProjectSidebarProps) {
	const reducedMotion = useReducedMotion()
	const {
		form,
		hasEscrow,
		isGoalReached,
		isDonationReady,
		isEscrowDataLoading,
		progressPercentage,
		onChainRaised,
		isFetchingBalance,
		isMounted,
		isFollowing,
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
		onSubmit,
		handleToggleFollow,
		shareUrl,
	} = useProjectSidebar(project, projectSlug)

	return (
		<motion.div
			className="overflow-hidden sticky top-16 rounded-xl shadow-md"
			initial={reducedMotion ? false : { opacity: 0, y: 20 }}
			animate={reducedMotion ? false : { opacity: 1, y: 0 }}
			transition={reducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
		>
			<div className="p-6">
				<div className="flex items-center gap-2 mb-2">
					<h2 className="text-xl font-bold">Support This Project</h2>
					{hasEscrow && isGoalReached ? (
						<Badge
							variant="secondary"
							className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0"
							aria-label="This project has reached its funding goal"
						>
							Goal reached
						</Badge>
					) : hasEscrow ? (
						<Badge
							variant="secondary"
							className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0"
							aria-label="This project accepts donations"
						>
							Accepting donations
						</Badge>
					) : (
						<Badge
							variant="secondary"
							className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0"
							aria-label="Donations coming soon"
						>
							Donations coming soon
						</Badge>
					)}
				</div>
				<p className="mb-4 text-muted-foreground">
					{!hasEscrow
						? 'This project is still setting up secure escrow. Donations will be available soon.'
						: isGoalReached
							? 'This project has reached its fundraising goal. Thank you for your support!'
							: 'Your contribution matters. Join the change.'}
				</p>

				<ProjectProgressBar
					progressPercentage={progressPercentage}
					onChainRaised={onChainRaised}
					projectRaised={project.raised}
					isFetchingBalance={isFetchingBalance}
				/>

				<DonationForm
					project={project}
					hasEscrow={hasEscrow}
					isGoalReached={isGoalReached}
					isDonationReady={isDonationReady}
					isEscrowDataLoading={isEscrowDataLoading}
					form={form}
					onSubmit={onSubmit}
				/>

				<DonationNotices hasEscrow={hasEscrow} isGoalReached={isGoalReached} />

				{project.escrowContractAddress && (
					<EscrowContractInfo escrowContractAddress={project.escrowContractAddress} />
				)}

				<SidebarActions
					isFollowing={isFollowing}
					onToggleFollow={handleToggleFollow}
					shareUrl={shareUrl}
					shareTitle={project.title}
					shareDescription={project.description ?? undefined}
				/>

				<WalletStatusPanel
					isMounted={isMounted}
					isConnected={isConnected}
					walletName={walletName}
					address={address}
					onConnect={connect}
					onDisconnect={disconnect}
				/>
			</div>

			{project.foundation && <FoundationLink foundation={project.foundation} />}

			<ProjectTagsPanel tags={project.tags} />
		</motion.div>
	)
}
