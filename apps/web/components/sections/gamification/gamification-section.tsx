'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { useState } from 'react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
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
		<Card className="border-0 shadow-xl bg-card">
			<CardHeader className="relative z-10">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-foreground">
						<motion.div
							animate={{ rotate: [0, 10, -10, 0] }}
							transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
						>
							<Trophy className="h-5 w-5 text-primary" />
						</motion.div>
						Gamification Hub
					</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="relative z-10">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="quests">Quests</TabsTrigger>
						<TabsTrigger value="streaks">Streaks</TabsTrigger>
						<TabsTrigger value="referrals">Referrals</TabsTrigger>
						<TabsTrigger value="nfts">NFTs</TabsTrigger>
					</TabsList>
					<AnimatePresence mode="wait">
						<TabsContent value="quests" className="mt-6">
							<motion.div
								key="quests"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.2 }}
							>
								<QuestEngine />
							</motion.div>
						</TabsContent>
						<TabsContent value="streaks" className="mt-6">
							<motion.div
								key="streaks"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.2 }}
							>
								<StreakTracker />
							</motion.div>
						</TabsContent>
						<TabsContent value="referrals" className="mt-6">
							<motion.div
								key="referrals"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.2 }}
							>
								<ReferralEngine />
							</motion.div>
						</TabsContent>
						<TabsContent value="nfts" className="mt-6">
							<motion.div
								key="nfts"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.2 }}
							>
								<NFTCollection />
							</motion.div>
						</TabsContent>
					</AnimatePresence>
				</Tabs>
			</CardContent>
		</Card>
	)
}
