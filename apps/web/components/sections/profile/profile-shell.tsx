import { cn } from '~/lib/utils'

interface ProfileShellProps {
	children: React.ReactNode
	className?: string
}

export function ProfileShell({ children, className }: ProfileShellProps) {
	return (
		<div className={cn('relative min-h-screen overflow-hidden bg-[#fafbfc]', className)}>
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 bg-grid-slate-100/60 [mask-image:radial-gradient(ellipse_at_top,white,transparent_75%)]" />
				<div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
				<div className="absolute -left-24 top-40 h-64 w-64 rounded-full bg-indigo-200/25 blur-3xl" />
				<div className="absolute bottom-0 left-1/2 h-48 w-[480px] -translate-x-1/2 rounded-full bg-emerald-100/30 blur-3xl" />
			</div>
			<div className="relative">{children}</div>
		</div>
	)
}
