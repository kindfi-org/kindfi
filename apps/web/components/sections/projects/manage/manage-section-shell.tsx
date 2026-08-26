import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'
import { ManageSectionHeader } from './manage-section-header'

type ManageSectionShellProps = {
	title: string
	description?: string
	actions?: ReactNode
	children: ReactNode
	className?: string
}

/**
 * Consistent spacing under ManageSectionHeader for list/form manage pages.
 */
export function ManageSectionShell({
	title,
	description,
	actions,
	children,
	className,
}: ManageSectionShellProps) {
	return (
		<div className={cn('space-y-6', className)}>
			<ManageSectionHeader title={title} description={description} actions={actions} />
			{children}
		</div>
	)
}
