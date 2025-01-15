interface FeatureCardProps {
	icon: React.ReactNode
	title: string
	description: string
	className?: string
}

export const FeatureCard = ({
	icon,
	title,
	description,
	className = '',
}: FeatureCardProps) => {
	return (
		<div className={`text-center ${className}`}>
			<div className="mb-4 flex justify-center">{icon}</div>
			<h3 className="text-lg font-semibold mb-2">{title}</h3>
			<p className="text-gray-600 text-sm">{description}</p>
		</div>
	)
}
