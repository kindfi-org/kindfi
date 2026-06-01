import { cn } from '~/lib/utils'

interface ProfileSectionHeaderProps {
	eyebrow?: string
	title: string
	highlight?: string
	description?: string
	className?: string
	align?: 'left' | 'center'
}

export function ProfileSectionHeader({
	eyebrow,
	title,
	highlight,
	description,
	className,
	align = 'left',
}: ProfileSectionHeaderProps) {
	return (
		<div className={cn('space-y-2', align === 'center' && 'text-center', className)}>
			{eyebrow ? (
				<p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-700/80">
					{eyebrow}
				</p>
			) : null}
			<h2 className="text-balance text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
				{title} {highlight ? <span className="gradient-text">{highlight}</span> : null}
			</h2>
			{description ? (
				<p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
					{description}
				</p>
			) : null}
		</div>
	)
}
