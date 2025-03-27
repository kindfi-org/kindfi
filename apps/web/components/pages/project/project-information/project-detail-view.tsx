'use client'

import { ChevronLeft, Heart, Share2, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '~/components/base/button'
import { Progress } from '~/components/base/progress'
import { Separator } from '~/components/base/separator'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '~/components/base/tabs'

//? Import Project Detail Components
import BusinessModel from '~/components/sections/projects/business-model'
import CompetitiveAdvantages from '~/components/sections/projects/competitive-advantages'
import InvestmentDetails from '~/components/sections/projects/investment-details'
import MarketOpportunity from '~/components/sections/projects/market-opportunity'
import ProjectDocuments from '~/components/sections/projects/project-documents'
import ProjectOverview from '~/components/sections/projects/project-overview'
import Technology from '~/components/sections/projects/technology'
import TractionMilestones from '~/components/sections/projects/traction-milestones'

//? Import Mock Data
import { businessModelData } from '~/lib/mock-data/mock-business-model'
import { competitiveAdvantagesData } from '~/lib/mock-data/mock-competitive-adventage'
import { investmentDetailsData } from '~/lib/mock-data/mock-investment-details'
import { marketOpportunityData } from '~/lib/mock-data/mock-market-opportunity'
import { projectDocumentsData } from '~/lib/mock-data/mock-project-documents'
import { projectData } from '~/lib/mock-data/mock-project-overview'
import { technologyData } from '~/lib/mock-data/mock-technology'
import { tractionMilestonesData } from '~/lib/mock-data/mock-traction-milestones'
import type { Project } from '~/lib/types'

interface ProjectDetailViewProps {
	project: Project
}

export function ProjectDetailView({ project }: ProjectDetailViewProps) {
	const [donationAmount, setDonationAmount] = useState<number>(
		project.min_investment || 10,
	)

	const targetAmount = project.target_amount || project.goal || 0
	const currentAmount = project.current_amount || project.raised || 0
	const percentageComplete =
		project.percentage_complete ||
		(currentAmount && targetAmount ? (currentAmount / targetAmount) * 100 : 0)

	const predefinedAmounts = [10, 25, 50, 100, 250]

	return (
		<div className="bg-gray-50 min-h-screen">
			{/* Back button and project navigation */}
			<div className="bg-white border-b border-gray-100">
				<div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center text-gray-600 hover:text-gray-900"
					>
						<ChevronLeft className="h-5 w-5 mr-1" />
						<span>Back to projects</span>
					</Link>

					<div className="flex items-center gap-4">
						<Button
							variant="outline"
							size="sm"
							className="flex items-center gap-1"
						>
							<Heart className="h-4 w-4" />
							<span>Save</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex items-center gap-1"
						>
							<Share2 className="h-4 w-4" />
							<span>Share</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Project header */}
			<header className="bg-white border-b border-gray-100 py-8">
				<div className="container max-w-7xl mx-auto px-4">
					<div className="flex flex-col md:flex-row gap-8">
						{/* Project image */}
						<div className="w-full md:w-2/5 lg:w-1/3">
							<div className="rounded-lg overflow-hidden relative aspect-[4/3]">
								<Image
									src={project.image_url || '/api/placeholder/600/450'}
									alt={project.title}
									fill
									className="object-cover"
								/>
							</div>

							{project.creator && (
								<div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
									<div className="flex items-center">
										<div className="flex-shrink-0 mr-3">
											<div className="relative h-12 w-12 rounded-full overflow-hidden">
												<Image
													src={
														project.creator.image || '/api/placeholder/48/48'
													}
													alt={project.creator.name}
													fill
													className="object-cover"
												/>
											</div>
										</div>

										<div>
											<h3 className="font-medium flex items-center">
												{project.creator.name}
												{project.creator.verified && (
													<span className="ml-1 bg-blue-500 text-white rounded-full p-0.5 text-xs">
														✓
													</span>
												)}
											</h3>
											<p className="text-sm text-gray-500">
												{project.creator.completed_projects} completed projects
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Project info */}
						<div className="w-full md:w-3/5 lg:w-2/3">
							<div className="flex flex-wrap gap-2 mb-4">
								{project.categories.length > 0 &&
									project.categories.map((category) => (
										<span
											key={category}
											className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
										>
											{category}
										</span>
									))}

								{project.location && (
									<span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
										{project.location}
									</span>
								)}

								{project.trending && (
									<span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
										Trending
									</span>
								)}
							</div>

							<h1 className="text-3xl font-bold mb-3">{project.title}</h1>

							<p className="text-gray-600 mb-6">{project.description}</p>

							<div className="mb-6">
								<div className="flex justify-between text-sm mb-2">
									<span className="font-bold text-xl">
										${currentAmount.toLocaleString()}
									</span>
									<span className="text-gray-500">
										${targetAmount.toLocaleString()} goal
									</span>
								</div>
								<Progress
									value={percentageComplete}
									className="h-3 bg-gray-100"
								/>
								<div className="flex justify-between mt-2 text-sm text-gray-600">
									<span>{percentageComplete.toFixed(2)}% funded</span>
									<div className="flex items-center">
										<Users className="h-4 w-4 mr-1" />
										<span>
											{project.investors_count || project.donors || 0} donors
										</span>
									</div>
								</div>
							</div>

							{/* Donation form */}
							<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
								<h2 className="text-xl font-bold mb-4">Support This Project</h2>

								<div className="mb-4">
									{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Select an amount
									</label>
									<div className="grid grid-cols-5 gap-2">
										{predefinedAmounts.map((amount) => (
											// biome-ignore lint/a11y/useButtonType: <explanation>
											<button
												key={amount}
												className={`py-2 px-4 rounded-md border ${
													donationAmount === amount
														? 'border-primary bg-primary/10 text-primary'
														: 'border-gray-300 hover:bg-gray-100'
												}`}
												onClick={() => setDonationAmount(amount)}
											>
												${amount}
											</button>
										))}
									</div>
								</div>

								<div className="mb-6">
									{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Custom amount
									</label>
									<div className="relative">
										<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
											<span className="text-gray-500">$</span>
										</div>
										<input
											type="number"
											className="block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
											value={donationAmount}
											onChange={(e) =>
												setDonationAmount(Number(e.target.value))
											}
											min={1}
										/>
									</div>
								</div>

								<Button className="w-full py-3 text-lg">
									Donate ${donationAmount}
								</Button>
							</div>

							{/* Tags */}
							{project.tags && project.tags.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-4">
									{project.tags.map((tag, index) => (
										<span
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={index}
											className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
										>
											{typeof tag === 'string' ? tag : tag.text}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Project details tabs */}
			<div className="container max-w-7xl mx-auto px-4 py-8">
				<Tabs defaultValue="about" className="w-full">
					<TabsList className="mb-8">
						<TabsTrigger value="about">About</TabsTrigger>
						<TabsTrigger value="details">Project Details</TabsTrigger>
						<TabsTrigger value="updates">Updates</TabsTrigger>
						<TabsTrigger value="donors">Donors</TabsTrigger>
						<TabsTrigger value="comments">Comments</TabsTrigger>
					</TabsList>

					<TabsContent
						value="about"
						className="bg-white rounded-lg p-6 border border-gray-100"
					>
						<h2 className="text-2xl font-bold mb-4">About This Project</h2>

						<div className="prose max-w-none">
							<p className="mb-4">{project.description}</p>

							<p className="mb-4">
								This project aims to create a sustainable and impactful solution
								for our community. With your support, we can achieve our goals
								and make a real difference.
							</p>

							<h3 className="text-xl font-bold mt-6 mb-3">Our Mission</h3>
							<p className="mb-4">
								We're dedicated to providing innovative solutions that address
								key challenges in our field. Our team brings together expertise
								and passion to ensure successful outcomes.
							</p>

							<h3 className="text-xl font-bold mt-6 mb-3">
								How Funds Will Be Used
							</h3>
							<ul className="list-disc pl-6 mb-6">
								<li className="mb-2">40% - Direct project implementation</li>
								<li className="mb-2">25% - Community outreach and education</li>
								<li className="mb-2">20% - Materials and equipment</li>
								<li className="mb-2">10% - Administrative expenses</li>
								<li className="mb-2">5% - Contingency fund</li>
							</ul>

							{project.milestones && (
								<>
									<h3 className="text-xl font-bold mt-6 mb-3">
										Project Milestones
									</h3>
									<div className="space-y-4">
										{Array.from({ length: project.milestones }).map(
											(_, index) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
													key={index}
													className={`p-4 rounded-lg border ${
														index < (project.completed_milestones || 0)
															? 'bg-green-50 border-green-200'
															: 'bg-gray-50 border-gray-200'
													}`}
												>
													<div className="flex items-start">
														<div
															className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
																index < (project.completed_milestones || 0)
																	? 'bg-green-500 text-white'
																	: 'bg-gray-300 text-gray-600'
															}`}
														>
															{index < (project.completed_milestones || 0)
																? '✓'
																: index + 1}
														</div>
														<div>
															<h4 className="font-medium">
																Milestone {index + 1}
															</h4>
															<p className="text-sm text-gray-600">
																{index < (project.completed_milestones || 0)
																	? 'Completed on January 15, 2025'
																	: 'Estimated completion: June 30, 2025'}
															</p>
															<p className="mt-2">
																Lorem ipsum dolor sit amet, consectetur
																adipiscing elit.
															</p>
														</div>
													</div>
												</div>
											),
										)}
									</div>
								</>
							)}
						</div>
					</TabsContent>

					<TabsContent
						value="details"
						className="bg-white rounded-lg p-6 border border-gray-100"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold">
								Detailed Project Information
							</h2>
						</div>

						{/* Project Overview */}
						<section className="mb-12">
							<ProjectOverview {...projectData} />
						</section>

						<Separator className="my-12" />

						{/* Business Model */}
						<section className="mb-12">
							<BusinessModel {...businessModelData} />
						</section>

						<Separator className="my-12" />

						{/* Market Opportunity */}
						<section className="mb-12">
							<MarketOpportunity {...marketOpportunityData} />
						</section>

						<Separator className="my-12" />

						{/* Technology and Competitive Advantages - Side by Side on larger screens */}
						<section className="mb-12">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								<div>
									<Technology {...technologyData} />
								</div>
								<div>
									<CompetitiveAdvantages {...competitiveAdvantagesData} />
								</div>
							</div>
						</section>

						<Separator className="my-12" />

						{/* Traction & Milestones */}
						<section className="mb-12">
							<TractionMilestones {...tractionMilestonesData} />
						</section>

						<Separator className="my-12" />

						{/* Investment Details and Documents - Side by Side on larger screens */}
						<section className="mb-12">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
								<div>
									<InvestmentDetails {...investmentDetailsData} />
								</div>
								<div className="lg:mt-16">
									<ProjectDocuments {...projectDocumentsData} />
								</div>
							</div>
						</section>
					</TabsContent>

					<TabsContent
						value="updates"
						className="bg-white rounded-lg p-6 border border-gray-100"
					>
						<h2 className="text-2xl font-bold mb-4">Project Updates</h2>
						<p className="text-gray-500">No updates have been posted yet.</p>
					</TabsContent>

					<TabsContent
						value="donors"
						className="bg-white rounded-lg p-6 border border-gray-100"
					>
						<h2 className="text-2xl font-bold mb-4">Donors</h2>
						<div className="space-y-4">
							{[1, 2, 3, 4, 5].map((donor) => (
								<div
									key={donor}
									className="flex items-center p-4 border-b border-gray-100 last:border-b-0"
								>
									<div className="relative h-10 w-10 rounded-full overflow-hidden mr-4">
										<Image
											// biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
											src={`/api/placeholder/40/40`}
											alt="Donor avatar"
											fill
											className="object-cover"
										/>
									</div>
									<div>
										<h3 className="font-medium">Anonymous Donor</h3>
										<p className="text-sm text-gray-500">
											Donated $50 • 3 days ago
										</p>
									</div>
								</div>
							))}
						</div>
					</TabsContent>

					<TabsContent
						value="comments"
						className="bg-white rounded-lg p-6 border border-gray-100"
					>
						<h2 className="text-2xl font-bold mb-4">Comments</h2>
						<p className="text-gray-500 mb-4">
							Be the first to comment on this project.
						</p>

						<div className="border border-gray-200 rounded-lg p-4">
							<h3 className="font-medium mb-2">Add a comment</h3>
							<textarea
								className="w-full border border-gray-300 rounded-md p-2 mb-3"
								rows={3}
								placeholder="Write your comment here..."
							/>
							<Button>Post Comment</Button>
						</div>
					</TabsContent>
				</Tabs>
			</div>

			{/* Related projects section */}
			<div className="container max-w-7xl mx-auto px-4 py-8">
				<h2 className="text-2xl font-bold mb-6">Similar Projects</h2>
				<p className="text-gray-500">Coming soon...</p>
			</div>
		</div>
	)
}
