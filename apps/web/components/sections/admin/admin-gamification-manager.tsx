'use client'

import { useState } from 'react'
import {
	IoPeopleOutline,
	IoStatsChartOutline,
	IoTrophyOutline,
} from 'react-icons/io5'
import { AdminQuestManager } from '~/components/sections/admin/admin-quest-manager'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'

export function AdminGamificationManager() {
	const [activeTab, setActiveTab] = useState('quests')

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Gamification Management"
				description="Manage quests, streaks, and referral systems"
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="quests" className="flex items-center gap-2">
						<IoTrophyOutline className="h-4 w-4" />
						Quests
					</TabsTrigger>
					<TabsTrigger value="streaks" className="flex items-center gap-2">
						<IoStatsChartOutline className="h-4 w-4" />
						Streaks
					</TabsTrigger>
					<TabsTrigger value="referrals" className="flex items-center gap-2">
						<IoPeopleOutline className="h-4 w-4" />
						Referrals
					</TabsTrigger>
				</TabsList>

				<TabsContent value="quests" className="mt-6">
					<AdminQuestManager />
				</TabsContent>

				<TabsContent value="streaks" className="mt-6">
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="text-lg font-semibold mb-4">Streak Management</h2>
						<p className="text-sm text-muted-foreground">
							Streak tracking is automatically managed by the system. View streak
							statistics and settings here.
						</p>
						{/* TODO: Add streak statistics and management */}
					</div>
				</TabsContent>

				<TabsContent value="referrals" className="mt-6">
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="text-lg font-semibold mb-4">Referral Management</h2>
						<p className="text-sm text-muted-foreground">
							Referral tracking is automatically managed by the system. View referral
							statistics and manage referral settings here.
						</p>
						{/* TODO: Add referral statistics and management */}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
