'use client'

import { useState } from 'react'
import {
	IoFlashOutline,
	IoPeopleOutline,
	IoStatsChartOutline,
	IoTrophyOutline,
} from 'react-icons/io5'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/base/tabs'
import { AdminGamificationTriggers } from '~/components/sections/admin/admin-gamification-triggers'
import { AdminQuestManager } from '~/components/sections/admin/admin-quest-manager'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'

export function AdminGamificationManager() {
	const [activeTab, setActiveTab] = useState('triggers')

	return (
		<div className="space-y-6">
			<AdminSectionHeader
				title="Gamification Management"
				description="Manage quests and manually trigger on-chain gamification contracts for verification"
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
					<TabsTrigger value="triggers" className="flex items-center gap-2">
						<IoFlashOutline className="h-4 w-4" />
						Triggers
					</TabsTrigger>
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

				<TabsContent value="triggers" className="mt-6">
					<AdminGamificationTriggers />
				</TabsContent>

				<TabsContent value="quests" className="mt-6">
					<AdminQuestManager />
				</TabsContent>

				<TabsContent value="streaks" className="mt-6">
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 text-lg font-semibold">Streak Management</h2>
						<p className="text-sm text-muted-foreground">
							Streak tracking is automatically managed by the system. Use the Triggers tab to
							manually call <code className="text-xs">record_donation</code> on the streak contract
							for mainnet verification.
						</p>
					</div>
				</TabsContent>

				<TabsContent value="referrals" className="mt-6">
					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 text-lg font-semibold">Referral Management</h2>
						<p className="text-sm text-muted-foreground">
							Referral tracking is automatically managed by the system. Use the Triggers tab to
							manually call create, onboard, and donation methods on the referral contract.
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	)
}
