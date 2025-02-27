interface HeroSectionProps {
	title: string
	highlight?: string
	subtitle: string
	badge?: string
}

export const HeroSection: React.FC<HeroSectionProps> = ({
	title,
	highlight,
	subtitle,
	badge,
}) => {
	return (
		<section className="relative overflow-hidden bg-[#FAFAFA] py-24 lg:py-32">
			<div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent" />
			<div className="relative px-6 lg:px-8">
				<div className="container">
					<div className="max-w-3xl mx-auto text-center">
						{badge && (
							<div className="inline-flex items-center rounded-full border bg-white/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary mb-8">
								{badge}
							</div>
						)}
						<h1 className="text-4xl font-bold tracking-tight lg:text-6xl lg:leading-[1.2] text-balance mb-6">
							{title}
							{highlight && (
								<span className="text-primary block mt-2">{highlight}</span>
							)}
						</h1>
						<p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto mb-0">
							{subtitle}
						</p>
					</div>
				</div>
			</div>
		</section>
	)
}
