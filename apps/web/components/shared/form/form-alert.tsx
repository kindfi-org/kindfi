import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'

type FormAlertVariant = 'error' | 'success' | 'warning' | 'info'

const variantClasses: Record<FormAlertVariant, string> = {
	error: 'border-destructive/20 bg-destructive/5 text-destructive',
	success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
	warning: 'border-amber-200 bg-amber-50 text-amber-950',
	info: 'border-slate-200 bg-[#fafbfc] text-slate-700',
}

interface FormAlertProps {
	variant: FormAlertVariant
	children: ReactNode
	className?: string
	role?: 'alert' | 'status'
}

export function FormAlert({
	variant,
	children,
	className,
	role = variant === 'success' ? 'status' : 'alert',
}: FormAlertProps) {
	return (
		<div
			role={role}
			className={cn(
				'rounded-xl border px-4 py-3 text-sm leading-relaxed',
				variantClasses[variant],
				className,
			)}
		>
			{children}
		</div>
	)
}
