'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

const TAB_VALUES = ['overview', 'team', 'milestones', 'updates', 'community'] as const
type TabValue = (typeof TAB_VALUES)[number]

function parseTab(param: string | null): TabValue {
	if (param && TAB_VALUES.includes(param as TabValue)) return param as TabValue
	return 'overview'
}

interface ProjectTabsProps {
	project: ProjectDetail
}

export function ProjectTabs({ project }: ProjectTabsProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const tab = parseTab(searchParams.get('tab'))

	const setTab = (value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		if (value === 'overview') params.delete('tab')
		else params.set('tab', value)
		const q = params.toString()
		router.replace(q ? `${pathname}?${q}` : pathname ?? '/', { scroll: false })
	}

	return (
		<Tabs value={tab} onValueChange={setTab} className="w-full">
			<TabsList className="grid grid-cols-2 md:grid-cols-5 bg-muted mb-20 md:mb-8" aria-label="Project sections">
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
