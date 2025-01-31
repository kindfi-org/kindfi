import { ArrowRight, Check } from 'lucide-react'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardFooter } from '~/components/base/card'
import { ModelVariant } from '~/lib/types/home.types';

const variantStyles = {
	[ModelVariant.SECURE]: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
	[ModelVariant.SOCIAL]: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
	[ModelVariant.BLOCKCHAIN]: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
};

interface InvestmentModelCardProps {
	title: string
	description: string
	variant: ModelVariant
	icon: React.ReactNode
	capabilities: { id: string; text: string }[]
	onLearnMore?: () => void
}

export const InvestmentModelCard = ({
	title,
	description,
	variant,
	icon,
	capabilities,
	onLearnMore,
}: InvestmentModelCardProps) => {
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
					{capabilities?.map((capability) => (
						<div
							key={capability.id}
							className="flex items-center text-sm text-gray-600"
						>
							<Check className="w-4 h-4 mr-2 text-green-600" />
							{capability.text}
						</div>
					))}
				</div>
			</CardContent>

			<CardFooter className="p-6 pt-0">
				<Button
					variant="ghost"
					aria-label={`Learn More about ${title} investment model`}
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
