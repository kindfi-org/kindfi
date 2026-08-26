import { cn } from '~/lib/utils'

interface ProfileSurfaceCardProps {
	children: React.ReactNode
	className?: string
	padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses = {
	sm: 'p-4 sm:p-5',
	md: 'p-5 sm:p-6',
	lg: 'p-6 sm:p-8',
}

export function ProfileSurfaceCard({
	children,
	className,
	padding = 'md',
}: ProfileSurfaceCardProps) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-white/70 bg-white/85 shadow-sm shadow-slate-200/60 backdrop-blur-sm',
				paddingClasses[padding],
				className,
			)}
		>
			{children}
		</div>
	)
}
