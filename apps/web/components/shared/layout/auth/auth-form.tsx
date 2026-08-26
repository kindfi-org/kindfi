import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { FormShell } from '~/components/shared/form/form-shell'
import { cn } from '~/lib/utils'

interface AuthFormProps {
	children: React.ReactNode
	title: string
	subtitle?: ReactNode
	icon?: LucideIcon
	className?: string
	footerContent?: ReactNode
}

/** @deprecated Prefer FormShell directly for new auth screens. */
export function AuthForm({
	children,
	title,
	subtitle,
	icon,
	className,
	footerContent,
}: AuthFormProps) {
	return (
		<FormShell
			title={title}
			subtitle={subtitle}
			icon={icon}
			footer={footerContent}
			className={cn(className)}
		>
			{children}
		</FormShell>
	)
}
