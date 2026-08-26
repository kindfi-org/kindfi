import type { ReactNode } from 'react'
import { formLayoutClasses } from '~/lib/form/form-styles'
import { cn } from '~/lib/utils'

interface FormActionsProps {
	children: ReactNode
	className?: string
	align?: 'between' | 'end'
}

export function FormActions({ children, className, align = 'between' }: FormActionsProps) {
	return (
		<div
			className={cn(
				align === 'end' ? formLayoutClasses.actionsEnd : formLayoutClasses.actions,
				className,
			)}
		>
			{children}
		</div>
	)
}
