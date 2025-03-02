import { ArrowRight, Shield } from 'lucide-react'
import { Button } from '~/components/base/button'

interface CTASectionProps {
	title: string
	description: string
	primaryButtonText: string
	secondaryButtonText: string
}

export const CTASection: React.FC<CTASectionProps> = ({
	title,
	description,
	primaryButtonText,
	secondaryButtonText,
}) => {
	return (
		<section className="py-24 lg:py-32 px-6 lg:px-8 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent" />
			<div className="container relative">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					<h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
						{title}
					</h2>
					<p className="text-lg text-muted-foreground md:text-xl">
						{description}
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						<Button
							className="bg-primary hover:bg-primary/90 text-white h-12 px-8"
							size="lg"
						>
							{primaryButtonText}
							<ArrowRight className="ml-2 h-5 w-5" />
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-12 px-8 bg-white hover:bg-gray-50"
						>
							<Shield className="mr-2 h-5 w-5" />
							{secondaryButtonText}
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}
