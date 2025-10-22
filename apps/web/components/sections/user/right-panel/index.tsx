/** biome-ignore-all lint/a11y/useSemanticElements: any */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: any */
'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '~/components/base/card'
import { ScrollArea } from '~/components/base/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '~/components/base/tabs'
import { Button } from '~/components/base/button'
import { Separator } from '~/components/base/separator'
import { Plus, Settings, User } from 'lucide-react'
import type { DashboardMode } from '~/lib/types'
import {
	ActivitySkeleton,
	LatestUpdates,
	NavigationMenu,
	NavigationSkeleton,
	RecentActivity,
	UpdatesSkeleton,
} from './lazy-components'

export function RightPanel({
	initialMode = 'user',
}: {
	initialMode?: DashboardMode
}) {
	const [mode, setMode] = useState<DashboardMode>('user')

	useEffect(() => {
		setMode(initialMode)
	}, [initialMode])

    return (
        <Card
            className="w-full h-full bg-card rounded-none md:rounded-lg border"
            role="complementary"
            aria-label="Dashboard side panel"
        >
            <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Your Dashboard</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" aria-label="Settings">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardDescription className="mt-2">Quick access and updates</CardDescription>
                <div className="mt-3">
                    <Tabs
                        value={mode}
                        onValueChange={(value: string) => setMode(value as DashboardMode)}
                        className="w-full"
                        aria-label="Dashboard mode selection"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="user"
                                aria-label="Switch to user mode"
                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                            >
                                User
                            </TabsTrigger>
                            <TabsTrigger
                                value="creator"
                                aria-label="Switch to creator mode"
                                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                            >
                                Creator
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <Button size="sm" className="h-8" asChild isLink>
                        <Link href="/create-project">
                            <Plus className="h-4 w-4 mr-1" />
                            New Project
                        </Link>
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8" asChild isLink>
                        <Link href="/profile">View Profile</Link>
                    </Button>
                </div>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
                <ScrollArea className="flex-1 px-4 py-3" aria-label="Dashboard content">
                    <div className="space-y-6" aria-label="Dashboard sections">
                        <section aria-labelledby="nav-section">
                            <h3 id="nav-section" className="mb-2 text-sm font-medium text-muted-foreground">
                                Navigation
                            </h3>
                            <Suspense fallback={<NavigationSkeleton />}>
                                <NavigationMenu mode={mode} />
                            </Suspense>
                        </section>

                        <Separator className="my-2" />

                        <section aria-labelledby="updates-section">
                            <h3 id="updates-section" className="mb-2 text-sm font-medium text-muted-foreground">
                                Latest updates
                            </h3>
                            <Suspense fallback={<UpdatesSkeleton />}>
                                <LatestUpdates />
                            </Suspense>
                        </section>

                        <Separator className="my-2" />

                        <section aria-labelledby="activity-section">
                            <h3 id="activity-section" className="mb-2 text-sm font-medium text-muted-foreground">
                                Recent activity
                            </h3>
                            <Suspense fallback={<ActivitySkeleton />}>
                                <RecentActivity />
                            </Suspense>
                        </section>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
