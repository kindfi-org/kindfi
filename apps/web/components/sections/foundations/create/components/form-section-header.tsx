import type { LucideIcon } from 'lucide-react'

interface FormSectionHeaderProps {
	icon: LucideIcon
	title: string
	optional?: boolean
}

export function FormSectionHeader({
	icon: Icon,
	title,
	optional = false,
}: FormSectionHeaderProps) {
	return (
		<div className="flex items-center gap-2 pb-2 border-b">
			<Icon className="h-5 w-5 text-purple-600" aria-hidden="true" />
			<h3 className="text-lg font-semibold">{title}</h3>
			{optional && (
				<span className="text-sm text-muted-foreground ml-auto">Optional</span>
			)}
		</div>
	)
}
