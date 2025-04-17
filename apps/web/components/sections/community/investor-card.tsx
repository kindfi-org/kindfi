import { motion } from 'framer-motion'
import {
	BadgeCheck,
	GraduationCap,
	Handshake,
	Leaf,
	PawPrintIcon as Paw,
	Stethoscope,
} from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { fadeInUp } from '~/lib/constants/animations'
import type { Investor } from '~/lib/types/investors/top-investors.types'

const iconMap = {
	Leaf,
	GraduationCap,
	Stethoscope,
	Handshake,
	Paw,
}

export function InvestorCard({ investor }: { investor: Investor }) {
	return (
		<motion.div variants={fadeInUp} className=" h-full">
			<Card className="h-full border-none bg-gray-100 shadow-lg shadow-gray-400/50">
				<CardContent className="p-6">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-400">
							<img
								src={investor.image || '/placeholder.svg'}
								alt=""
								className="w-full h-full object-cover"
							/>
						</div>
						<div>
							<div className="flex items-center gap-2 mb-2">
								<h3 className="text-lg font-bold">{investor.name}</h3>
								{investor.verified && <BadgeCheck className="h-4 w-4" />}
							</div>
							<Badge
								variant="outline"
								className={`${investor.levelClass} text-xs font-bold text-white`}
							>
								{investor.level}
							</Badge>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<div className="flex justify-between mb-1">
								<span className="text-sm text-muted-foreground">
									Total Impact
								</span>
								<span className="font-bold">{investor.totalImpact}</span>
							</div>
							<div className="flex justify-between mb-1">
								<span className="text-sm text-muted-foreground">
									Projects Supported
								</span>
								<span className="font-bold">{investor.projectsSupported}</span>
							</div>
							<div className="flex justify-between mb-4">
								<span className="text-sm text-muted-foreground">Followers</span>
								<span className="font-bold">{investor.followers}</span>
							</div>
						</div>

						<div>
							<p className="text-sm font-bold mb-2">Favorite Categories</p>
							<div className="flex gap-2">
								{investor.categories.map((category) => {
									const Icon = iconMap[category.icon as keyof typeof iconMap]
									return (
										<Badge
											key={category.name}
											variant="outline"
											className="bg-gray-300 text-xs font-bold text-black-500 flex items-center gap-1"
										>
											<Icon className="h-4 w-4" />
											{category.name}
										</Badge>
									)
								})}
							</div>
						</div>

						<div>
							<p className="text-sm font-medium mb-2">Recent Projects</p>
							<div className="space-y-1">
								{investor.recentProjects.map((project) => (
									<div
										key={project.name}
										className="flex justify-between items-center"
									>
										<span className="text-sm text-muted-foreground">
											{project.name}
										</span>
										<span className="font-medium">{project.amount}</span>
									</div>
								))}
							</div>
						</div>

						<div className="flex gap-3 pt-2">
							<Button
								variant="outline"
								className="flex-1 h-9 border-black-500 hover:bg-gray-100 hover:text-gray-900"
							>
								Follow
							</Button>
							<Button
								variant="default"
								className="flex-1 h-9 bg-gray-900 hover:bg-gray-800 text-white"
							>
								View Profile
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
