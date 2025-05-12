'use client'

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { CommunityTab } from './tabs/community-tab'
import { MilestonesTab } from './tabs/milestones-tab'
import { OverviewTab } from './tabs/overview-tab'
import { TeamTab } from './tabs/team-tab'
import { UpdatesTab } from './tabs/updates-tab'

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
				<OverviewTab project={project} />
			</TabsContent>
			<TabsContent value="team">
				<TeamTab team={project.team} />
			</TabsContent>
			<TabsContent value="milestones">
				<MilestonesTab milestones={project.milestones} />
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
