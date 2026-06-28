'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import type { ProjectDetail } from '~/lib/types/project/project-detail.types'
import { cn } from '~/lib/utils'
import { DonationsTab, MilestonesTab, OverviewTab, TeamTab, UpdatesTab } from './tabs'

const TAB_VALUES = ['overview', 'team', 'milestones', 'updates', 'donations'] as const
type TabValue = (typeof TAB_VALUES)[number]

function parseTab(param: string | null, hasTeam: boolean): TabValue {
	if (param === 'team' && !hasTeam) return 'overview'
	if (param === 'community') return 'donations'
	if (param && TAB_VALUES.includes(param as TabValue)) return param as TabValue
	return 'overview'
}

interface ProjectTabsProps {
	project: ProjectDetail
	projectSlug: string
}

export function ProjectTabs({ project, projectSlug }: ProjectTabsProps) {
	const router = useRouter()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const hasTeam = project.team.length > 0
	const tabParam = searchParams.get('tab')
	const tab = useMemo(() => parseTab(tabParam, hasTeam), [tabParam, hasTeam])

	useEffect(() => {
		if (tabParam === 'team' && !hasTeam) {
			const params = new URLSearchParams(searchParams.toString())
			params.delete('tab')
			const q = params.toString()
			router.replace(q ? `${pathname}?${q}` : (pathname ?? '/'), { scroll: false })
			return
		}

		if (tabParam === 'community') {
			const params = new URLSearchParams(searchParams.toString())
			params.set('tab', 'donations')
			router.replace(`${pathname}?${params.toString()}`, { scroll: false })
		}
	}, [tabParam, hasTeam, pathname, router, searchParams])

	const setTab = (value: string) => {
		const params = new URLSearchParams(searchParams.toString())
		if (value === 'overview') params.delete('tab')
		else params.set('tab', value)
		const q = params.toString()
		router.replace(q ? `${pathname}?${q}` : (pathname ?? '/'), { scroll: false })
	}

	return (
		<Tabs value={tab} onValueChange={setTab} className="w-full">
			<TabsList
				className={cn(
					'grid grid-cols-2 bg-muted mb-20 md:mb-8',
					hasTeam ? 'md:grid-cols-5' : 'md:grid-cols-4',
				)}
				aria-label="Project sections"
			>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				{hasTeam ? <TabsTrigger value="team">Team</TabsTrigger> : null}
				<TabsTrigger value="milestones">Milestones</TabsTrigger>
				<TabsTrigger value="updates">Updates</TabsTrigger>
				<TabsTrigger value="donations">Latest Donations</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">
				<OverviewTab pitch={project.pitch} />
			</TabsContent>
			{hasTeam ? (
				<TabsContent value="team">
					<TeamTab team={project.team} />
				</TabsContent>
			) : null}
			<TabsContent value="milestones">
				<MilestonesTab
					milestones={project.milestones}
					escrowContractAddress={project.escrowContractAddress}
					escrowType={project.escrowType}
				/>
			</TabsContent>
			<TabsContent value="updates">
				<UpdatesTab updates={project.updates} projectId={project.id} />
			</TabsContent>
			<TabsContent value="donations">
				<DonationsTab projectSlug={projectSlug} />
			</TabsContent>
		</Tabs>
	)
}
