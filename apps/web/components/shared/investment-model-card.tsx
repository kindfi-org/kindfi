import { ArrowRight, Check } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardFooter } from '~/components/base/card'

interface InvestmentModelCardProps {
	title: string
	description: string
	variant: 'a' | 'b' | 'c'
	icon: React.ReactNode
	benefits: string[]
	onLearnMore?: () => void
}

export const InvestmentModelCard = ({
	title,
	description,
	variant,
	icon,
	benefits,
	onLearnMore,
}: InvestmentModelCardProps) => {
	const variantStyles = {
		a: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
		b: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
		c: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
	}

	return (
		<Card
			className={`transition-all duration-200 ${variantStyles[variant]} border`}
		>
			<CardContent className="p-6">
				<div className="flex flex-col items-center text-center mb-6">
					{icon}
					<h3 className="text-xl font-semibold mb-2">{title}</h3>
					<p className="text-gray-600 text-sm">{description}</p>
				</div>

				<div className="space-y-3">
					{benefits?.map((benefit) => (
						<div
							key={benefit}
							className="flex items-center text-sm text-gray-600"
						>
							<Check className="w-4 h-4 mr-2 text-green-600" />
							{benefit}
						</div>
					))}
				</div>
			</CardContent>

			<CardFooter className="p-6 pt-0">
				<Button
					variant="ghost"
					className="w-full flex items-center justify-center gap-2 hover:bg-white/50"
					onClick={onLearnMore}
				>
					Learn More
					<ArrowRight className="w-4 h-4" />
				</Button>
			</CardFooter>
		</Card>
	)
}
