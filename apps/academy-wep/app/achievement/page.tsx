'use client'
import { Award } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

// Using RORO (Receive an Object, Return an Object) pattern for props
type NFTAchievementProps = {
	title?: {
		first: string
		highlighted: string
	}
	description?: string
	badgeText?: string
	buttons?: {
		primary: {
			text: string
			onClick?: () => void
		}
		secondary: {
			text: string
			onClick?: () => void
		}
	}
}

export function NFTAchievement({
	title = {
		first: 'NFT Achievement',
		highlighted: 'Badges',
	},
	description = 'Earn these NFT badges as you complete modules. These badges are stored on the Stellar blockchain and serve as proof of your blockchain proficiency.',
	badgeText = 'Blockchain Achievements',
	buttons = {
		primary: {
			text: 'View Your Collection',
			onClick: () => console.log('View collection clicked'),
		},
		secondary: {
			text: 'Learn More About NFTs',
			onClick: () => console.log('Learn more clicked'),
		},
	},
}: NFTAchievementProps) {
	return (
		<section className="w-full mx-auto flex justify-center items-center h-screen">
			<div className="p-6 bg-slate-50 rounded-2xl shadow-sm">
				<div className="flex flex-col items-center text-center space-y-6 ">
					{/* Badge */}
					<div className="inline-flex items-center">
						<Badge className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-100 border-0 flex items-center gap-1.5">
							<Award className="h-4 w-4" />
							<span>{badgeText}</span>
						</Badge>
					</div>

					{/* Title */}
					<h2 className="text-4xl font-bold md:text-5xl">
						<span className="text-slate-900">{title.first} </span>
						<span className="text-green-700">{title.highlighted}</span>
					</h2>

					{/* Description */}
					<p className="text-slate-700 max-w-2xl text-lg">{description}</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 pt-4">
						<Button
							onClick={buttons.primary.onClick}
							className="bg-gradient-to-r from-green-500 to-slate-900 hover:from-green-600 hover:to-slate-800 text-white border-0"
						>
							{buttons.primary.text}
						</Button>
						<Button
							variant="outline"
							onClick={buttons.secondary.onClick}
							className="border-slate-300 text-slate-800 hover:bg-slate-100"
						>
							{buttons.secondary.text}
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}

export default NFTAchievement
