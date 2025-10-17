'use client'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/base/card'
import { ProjectRightPanel } from '~/components/sections/project-details/project-right-panel'
import { HighlightedProjects } from '~/components/sections/home/highlighted-projects'

interface CreatorProfileProps {
    userId: string
    displayName: string
}

export function CreatorProfile({ displayName }: CreatorProfileProps) {
    return (
        <div className="space-y-8 p-4">
            <header className="space-y-1">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                <p className="text-muted-foreground">Your campaigns & milestones</p>
            </header>

            <section className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Active Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <HighlightedProjects />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Milestones & Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Reuse right-panel flow to simulate milestones/donations received */}
                        <ProjectRightPanel />
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}


