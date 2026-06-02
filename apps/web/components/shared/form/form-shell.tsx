'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '~/components/base/card'
import { cn } from '~/lib/utils'

interface FormShellProps {
	title: string
	subtitle?: ReactNode
	icon?: LucideIcon
	footer?: ReactNode
	children: ReactNode
	className?: string
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

const maxWidthClasses = {
	sm: 'max-w-sm',
	md: 'max-w-md',
	lg: 'max-w-lg',
	xl: 'max-w-xl',
} as const

export function FormShell({
	title,
	subtitle,
	icon: Icon,
	footer,
	children,
	className,
	maxWidth = 'md',
}: FormShellProps) {
	return (
		<Card
			className={cn(
				'w-full overflow-hidden border-slate-200/80 shadow-lg',
				maxWidthClasses[maxWidth],
				className,
			)}
		>
			<CardHeader className="space-y-2 border-b bg-[#fafbfc] px-6 pb-5 pt-6">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1 text-left">
						<h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
						{subtitle ? (
							<div className="text-sm leading-relaxed text-muted-foreground">{subtitle}</div>
						) : null}
					</div>
					{Icon ? (
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
							<Icon className="h-6 w-6" aria-hidden="true" />
						</div>
					) : null}
				</div>
			</CardHeader>
			<CardContent className="px-6 py-6">{children}</CardContent>
			{footer ? <CardFooter className="border-t bg-white px-6 py-5">{footer}</CardFooter> : null}
		</Card>
	)
}
