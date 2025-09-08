'use client'

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import {
	CommunityTab,
	MilestonesTab,
	OverviewTab,
	TeamTab,
	UpdatesTab,
} from './tabs'

interface ProjectTabsProps {
	project: ProjectDetail
}

export function ProjectTabs({ project }: ProjectTabsProps) {
	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList className="grid grid-cols-2 md:grid-cols-5 bg-muted mb-20 md:mb-8">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="team">Team</TabsTrigger>
				<TabsTrigger value="milestones">Milestones</TabsTrigger>
				<TabsTrigger value="updates">Updates</TabsTrigger>
				<TabsTrigger value="community">Community</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<OverviewTab pitch={project.pitch} />
			</TabsContent>
			<TabsContent value="team">
				<TeamTab team={project.team} />
			</TabsContent>
			<TabsContent value="milestones">
				<MilestonesTab
					milestones={project.milestones}
					escrowContractAddress={project.escrowContractAddress}
					escrowType={project.escrowType}
				/>
			</TabsContent>
			<TabsContent value="updates">
				<UpdatesTab updates={project.updates} />
			</TabsContent>
			<TabsContent value="community">
				<CommunityTab comments={project.comments} />
			</TabsContent>
		</Tabs>
	)
}
