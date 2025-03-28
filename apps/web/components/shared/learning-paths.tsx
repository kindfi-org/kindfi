import { Layout, Zap } from 'lucide-react'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'

const iconMap = {
	Layout: Layout,
	Zap: Zap,
}
const cardIconStyles = 'w-8 h-8 text-primary mr-4 flex-shrink-0'
const learningPaths = [
	{
		icon: 'Layout',
		title: 'Blockchain Fundamentals',
		description:
			'Master the core concepts of blockchain technology and understand how it enables transparent, secure transactions.',
		modules: '6 Modules',
		level: 'Beginner',
		duration: '4 Weeks',
		buttonVariant: 'outline',
	},
	{
		icon: 'Zap',
		title: 'Impact Crowdfunding',
		description:
			'Discover strategies for creating successful crowdfunding campaigns that leverage blockchain for transparency and trust.',
		modules: '5 Modules',
		level: 'All Levels',
		duration: '3 Weeks',
		buttonVariant: 'ghost',
	},
]

export default function LearningPaths() {
	return (
		<div className="p-8 max-w-5xl mx-auto">
			{/* Top Section with Badge and View All Button */}
			<div className="flex items-center justify-between">
				<Badge variant={'secondary'} className="bg-green-700">
					Learning Paths
				</Badge>
				<Button variant="outline">View All Paths</Button>
			</div>
			{/* Header Text */}
			<h2 className="text-2xl font-bold text-gray-800 mt-4">
				Choose Your Learning{' '}
				<span className="bg-gradient-to-l from-secondary to-primary bg-clip-text text-transparent">
					Journey
				</span>
			</h2>
			``
			{/* Learning Path Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
				{learningPaths.map((path, index) => {
					const IconComponent = iconMap[path.icon]
					return (
						<Card key={index} className="p-4 shadow-lg flex items-start">
							{IconComponent && (
								<IconComponent
									className={`w-10 h-10 ml-4 mr-6 ${
										path.icon === 'Zap' ? 'text-blue-500' : 'text-primary'
									}`}
								/>
							)}
							<div>
								<CardHeader className="flex flex-col gap-2">
									<CardTitle className="text-black">{path.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-600 text-sm">{path.description}</p>
									<div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
										<span>{path.modules}</span> | <span>{path.level}</span> |{' '}
										<span>{path.duration}</span>
									</div>
									<Button
										variant={
											path.buttonVariant === 'outline'
												? 'outline'
												: 'destructive'
										}
										className={`w-full mt-4 ${
											path.buttonVariant === 'outline'
												? 'bg-gradient-to-l from-secondary to-primary'
												: 'bg-blue-700'
										}`}
									>
										Start This Path →
									</Button>
								</CardContent>
							</div>
						</Card>
					)
				})}
			</div>
		</div>
	)

}
