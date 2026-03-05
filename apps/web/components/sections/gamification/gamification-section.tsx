'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useState } from 'react'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { NFTCollection } from './nft-collection'
import { QuestEngine } from './quest-engine'
import { ReferralEngine } from './referral-engine'
import { StreakTracker } from './streak-tracker'

export function GamificationSection() {
	const [activeTab, setActiveTab] = useState('quests')

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Trophy className="h-5 w-5 text-primary" />
				<h2 className="text-xl font-bold text-foreground">Gamification Hub</h2>
			</div>
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="quests">Quests</TabsTrigger>
					<TabsTrigger value="streaks">Streaks</TabsTrigger>
					<TabsTrigger value="referrals">Referrals</TabsTrigger>
					<TabsTrigger value="nfts">NFTs</TabsTrigger>
				</TabsList>
				<AnimatePresence mode="wait">
					<TabsContent value="quests" className="mt-4">
						<motion.div
							key="quests"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.15 }}
						>
							<QuestEngine />
						</motion.div>
					</TabsContent>
					<TabsContent value="streaks" className="mt-4">
						<motion.div
							key="streaks"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.15 }}
						>
							<StreakTracker />
						</motion.div>
					</TabsContent>
					<TabsContent value="referrals" className="mt-4">
						<motion.div
							key="referrals"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.15 }}
						>
							<ReferralEngine />
						</motion.div>
					</TabsContent>
					<TabsContent value="nfts" className="mt-4">
						<motion.div
							key="nfts"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.15 }}
						>
							<NFTCollection />
						</motion.div>
					</TabsContent>
				</AnimatePresence>
			</Tabs>
		</div>
	)
}
