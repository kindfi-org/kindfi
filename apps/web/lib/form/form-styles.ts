export const formFieldClasses = {
	item: 'space-y-2',
	label: 'text-sm font-medium text-slate-800',
	description: 'text-[0.8125rem] leading-relaxed text-muted-foreground',
	error: 'text-[0.8125rem] font-medium text-destructive',
} as const

export const inputClasses = {
	base:
		'flex h-11 w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-sm transition-[color,box-shadow,border-color] duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20',
	textarea:
		'flex min-h-[7rem] w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm transition-[color,box-shadow,border-color] duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20 md:text-sm',
} as const

export const formLayoutClasses = {
	stack: 'space-y-5',
	section: 'space-y-6',
	actions:
		'mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between',
	actionsEnd:
		'mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end',
} as const
