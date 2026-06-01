'use client'

import { motion } from 'framer-motion'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { ProjectSidebarActions } from './sidebar/project-sidebar-actions'
import { ProjectSidebarDonation } from './sidebar/project-sidebar-donation'
import { ProjectSidebarFooter } from './sidebar/project-sidebar-footer'
import { useProjectSidebar } from './sidebar/use-project-sidebar'

interface ProjectSidebarProps {
	project: ProjectDetail
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
	const {
		form,
		onSubmit,
		progressPercentage,
		onChainRaised,
		isFetchingBalance,
		isFollowing,
		handleToggleFollow,
		handleShare,
		address,
		walletName,
		isConnected,
		connect,
		disconnect,
	} = useProjectSidebar(project)

	return (
		<motion.div
			className="overflow-hidden sticky top-16 bg-white rounded-xl shadow-md"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className="p-6">
				<ProjectSidebarDonation
					project={project}
					form={form}
					onSubmit={onSubmit}
					progressPercentage={progressPercentage}
					onChainRaised={onChainRaised}
					isFetchingBalance={isFetchingBalance}
				/>
				<ProjectSidebarActions
					project={project}
					isFollowing={isFollowing}
					onToggleFollow={handleToggleFollow}
					onShare={handleShare}
					isConnected={isConnected}
					walletName={walletName}
					address={address}
					onConnect={connect}
					onDisconnect={disconnect}
				/>
			</div>
			<ProjectSidebarFooter project={project} />
		</motion.div>
	)
}
