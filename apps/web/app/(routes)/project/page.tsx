'use client'

import type React from 'react'
import TabNavigation from '~/components/base/tab-navigation'
import ProjectOverview from '~/components/sections/project/project-overview'
import ProjectShowcaseSection from '~/components/sections/project/project-showcase'
import ProjectUpdatesSection from '~/components/sections/project/project-updates'
import YourImpactSection from '~/components/sections/project/your-impact'
import { projectTabsData } from '~/lib/mock-data/mock-projects'

const TAB_COMPONENTS = {
    overview: ProjectOverview,
    updates: ProjectUpdatesSection,
    impact: YourImpactSection,
    showcase: ProjectShowcaseSection,
} as const

const ProjectDetailsPage = () => {
    const tabs = projectTabsData.map((tab) => {
        const Component = TAB_COMPONENTS[tab.id as keyof typeof TAB_COMPONENTS]
		const contentComponent = Component ? <Component key={tab.id} /> : null


        return {
            ...tab,
            content: contentComponent,
        }
    })

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Project Details</h1>
            <TabNavigation tabs={tabs} />
        </div>
    )
}