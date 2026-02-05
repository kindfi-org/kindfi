type AdminSectionHeaderProps = {
	title: string
	description?: string
	children?: React.ReactNode
}

export function AdminSectionHeader({
	title,
	description,
	children,
}: AdminSectionHeaderProps) {
	return (
		<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
			<div className="min-w-0">
				<h1 className="text-2xl font-bold tracking-tight text-pretty sm:text-3xl">
					{title}
				</h1>
				{description ? (
					<p className="mt-1 text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{children ? (
				<div className="mt-2 shrink-0 sm:mt-0">{children}</div>
			) : null}
		</div>
	)
}
