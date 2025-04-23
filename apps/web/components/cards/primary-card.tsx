import { cn } from '~/lib/utils'

type PrimaryCardProps = {
	children: React.ReactNode
	className?: string
}

export function PrimaryCard({ children, className }: PrimaryCardProps) {
	return (
		<div
			className={cn(
				'bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100',
				className,
			)}
		>
			{children}
		</div>
	)
}
