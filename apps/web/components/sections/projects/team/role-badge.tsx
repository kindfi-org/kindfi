import { Badge } from '~/components/base/badge'
import type { PendingInvitation } from '~/lib/types/project/team-members.types'
import { cn } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'

export function RoleBadge({ role }: { role: PendingInvitation['role'] }) {
	const meta = memberRole[role]
	const Icon = meta.icon
	return (
		<Badge
			variant="secondary"
			className={cn(
				'inline-flex items-center gap-1.5 px-2.5 py-1 leading-none',
				meta.badgeClass,
			)}
		>
			<Icon className={cn('h-3.5 w-3.5', meta.iconClass)} />
			{meta.label}
		</Badge>
	)
}
