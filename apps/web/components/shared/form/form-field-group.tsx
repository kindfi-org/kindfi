'use client'

import type { ReactNode } from 'react'
import { Label } from '~/components/base/label'
import { formFieldClasses } from '~/lib/form/form-styles'
import { cn } from '~/lib/utils'

interface FormFieldGroupProps {
	id: string
	label: ReactNode
	description?: ReactNode
	error?: ReactNode
	children: ReactNode
	className?: string
	required?: boolean
}

export function FormFieldGroup({
	id,
	label,
	description,
	error,
	children,
	className,
	required,
}: FormFieldGroupProps) {
	return (
		<div className={cn(formFieldClasses.item, className)}>
			<Label htmlFor={id} className={formFieldClasses.label}>
				{label}
				{required ? (
					<span className="ml-0.5 text-destructive" aria-hidden="true">
						*
					</span>
				) : null}
			</Label>
			{children}
			{error ? (
				<p role="alert" className={formFieldClasses.error}>
					{error}
				</p>
			) : description ? (
				<p className={formFieldClasses.description}>{description}</p>
			) : null}
		</div>
	)
}
