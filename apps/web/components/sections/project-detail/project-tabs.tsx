'use client'

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { OverviewTab } from './tabs/overview-tab'

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
				<p>TeamTab</p>
			</TabsContent>
			<TabsContent value="milestones">
				<p>MilestonesTab</p>
			</TabsContent>
			<TabsContent value="updates">
				<p>UpdatesTab</p>
			</TabsContent>
			<TabsContent value="community">
				<p>CommunityTab</p>
			</TabsContent>
		</Tabs>
	)
}
