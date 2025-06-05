'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardHeader } from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '~/components/base/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/base/dropdown-menu'
import { Progress } from '~/components/base/progress'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'
import { ErrorFallback } from '~/components/fallbacks/error-fallback'
import { LoadingFallback } from '~/components/fallbacks/loading-fallback'
import { Paginations } from '~/components/shared/pagination'
import { ACHIEVEMENT_CARDS, NFTDATA } from '~/lib/mock-data/section'
import type { NFTProps } from '~/lib/types'
import { AchievementCard } from './achievement-card'
import { NFTCard } from './nft-card'
import { StatsSection } from './stats-section'

const projectOptions = ['All', 'Project X', 'Project Y', 'Project Z']

export function AchievementsGrid() {
	const [achievements, setAchievements] = useState(ACHIEVEMENT_CARDS)
	const [activeTab, setActiveTab] = useState('achievements')
	const [selectedProject, setSelectedProject] = useState('All')
	const [selectedNFT, setSelectedNFT] = useState<NFTProps | null>(null)
	const [currentNFTPage, setCurrentNFTPage] = useState(1)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 1000)
		return () => clearTimeout(timer)
	}, [])

	const itemsPerPage = 3

	const updateAchievements = (index: number) => {
		setAchievements((prev) =>
			prev.map((achievement, i) => {
				if (i < index) return { ...achievement, status: 'completed' }
				if (i === index)
					return {
						...achievement,
						status: 'in-progress',
						progressPercentage: Math.floor(Math.random() * 80) + 10, // Random 10-90% for demo
					}
				return { ...achievement, status: 'locked' }
			}),
		)
	}

	const filteredNFTs = useMemo(
		() =>
			selectedProject === 'All'
				? NFTDATA
				: NFTDATA.filter((nft) => nft.project === selectedProject),
		[selectedProject],
	)

	const paginatedNFTs = filteredNFTs.slice(
		(currentNFTPage - 1) * itemsPerPage,
		currentNFTPage * itemsPerPage,
	)

	const totalNFTPages = Math.ceil(filteredNFTs.length / itemsPerPage)

	const completedCount = achievements.filter((a) => a.status === 'completed').length
	const progress = (completedCount / achievements.length) * 100

	return (
		<ErrorBoundary
			FallbackComponent={({ error, resetErrorBoundary }) => (
				<ErrorFallback
					error={error}
					resetErrorBoundary={resetErrorBoundary}
					title="Error loading achievements"
					message="There was a problem loading your achievements. Please try again."
					actionText="Reload"
				/>
			)}
		>
			{isLoading ? (
				<LoadingFallback description="Loading achievements..." />
			) : (
				<Card className="w-full max-w-5xl mx-auto my-10">
					<Tabs defaultValue="achievements" className="w-full">
						<CardHeader
							className={`flex flex-col sm:flex-row items-start sm:items-center ${
								activeTab === 'achievements' ? 'justify-end' : 'justify-between'
							} space-y-4 sm:space-y-0 pb-8`}
						>
							{activeTab !== 'achievements' && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" className="text-blue-600">
											Filter Nfts: {selectedProject}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										{projectOptions.map((project) => (
											<DropdownMenuItem
												key={project}
												onClick={() => {
													setSelectedProject(project)
													setCurrentNFTPage(1)
												}}
											>
												{project}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
							<TabsList className="bg-transparent w-full sm:w-auto">
								<TabsTrigger
									value="achievements"
									className="flex-1 sm:flex-none data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600"
									onClick={() => setActiveTab('achievements')}
								>
									Achievements
								</TabsTrigger>
								<TabsTrigger
									value="collection"
									className="flex-1 sm:flex-none data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600"
									onClick={() => setActiveTab('collection')}
								>
									Collection
								</TabsTrigger>
							</TabsList>
						</CardHeader>
						<TabsContent value="achievements">
							<CardContent className="space-y-8">
								{activeTab === 'achievements' && (
									<Card className="bg-blue-100">
										<CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
											<div className="flex items-center gap-4">
												<div className="p-3 bg-blue-200 rounded-full">
													<Trophy className="w-6 h-6 text-blue-600" />
												</div>
												<div>
													<h2 className="">Impact Champion</h2>
													<p className="text-sm font-light">
														5/10 projects supported
													</p>
												</div>
											</div>
											<Progress
												value={progress}
												className="h-2 w-full sm:w-1/4 bg-blue-200"
											/>
										</CardContent>
									</Card>
								)}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 achievement">
									{achievements.map((card, index) => (
										<AchievementCard
											key={card.id}
											id={card.id}
											title={card.title}
											status={card.status}
											icon={card.icon}
											progressPercentage={card.progressPercentage}
											description={card.description}
											onClick={() => updateAchievements(index)}
										/>
									))}
								</div>
							</CardContent>
						</TabsContent>
						<TabsContent value="collection">
							<CardContent className="space-y-8">
								<AnimatePresence mode="wait">
									<motion.div
										key={currentNFTPage}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -20 }}
										transition={{ duration: 0.3 }}
										className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 collection"
									>
										{paginatedNFTs.map((nft) => (
											<NFTCard
												key={nft.id}
												id={nft.id}
												title={nft.title}
												project={nft.project}
												imageUrl={nft.imageUrl}
												onClick={() => setSelectedNFT(nft)}
											/>
										))}
									</motion.div>
								</AnimatePresence>
								{totalNFTPages > 1 && (
									<div className="flex justify-center mt-6">
										<Paginations
											currentPage={currentNFTPage}
											totalPages={totalNFTPages}
											onPageChange={setCurrentNFTPage}
										/>
									</div>
								)}
								<StatsSection
									totalNFTs={filteredNFTs.length}
									rareItems={5}
									collections={3}
								/>
							</CardContent>
						</TabsContent>
					</Tabs>
					{selectedNFT && (
						<Dialog
							open={!!selectedNFT}
							onOpenChange={() => setSelectedNFT(null)}
						>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{selectedNFT.title}</DialogTitle>
									<DialogDescription>
										{selectedNFT.description}
									</DialogDescription>
								</DialogHeader>
								<Image
									src={selectedNFT.imageUrl || '/placeholder.svg'}
									alt={selectedNFT.title}
									className="w-full rounded-lg"
									width={500}
									height={500}
								/>
							</DialogContent>
						</Dialog>
					)}
				</Card>
			)}
		</ErrorBoundary>
	)
}
