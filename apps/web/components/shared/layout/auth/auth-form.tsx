import { cn } from '~/lib/utils'

interface AuthFormProps {
	children: React.ReactNode
	title: string
	subtitle?: React.ReactNode
	className?: string
	footerContent?: React.ReactNode
}

export function AuthForm({
	children,
	title,
	subtitle,
	className,
}: AuthFormProps) {
	return (
		<div className={cn('w-full space-y-6', className)}>
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				{subtitle && <div>{subtitle}</div>}
			</div>
			{children}
		</div>
	)
}
