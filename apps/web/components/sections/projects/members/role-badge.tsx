import type { Enums } from '@services/supabase'
import { Badge } from '~/components/base/badge'
import { cn } from '~/lib/utils'
import { memberRole } from '~/lib/utils/member-role'

export function RoleBadge({ role }: { role: Enums<'project_member_role'> }) {
	const meta = memberRole[role] ?? memberRole.others
	const Icon = meta.icon
	return (
		<Badge
			variant="secondary"
			className={cn(
				'inline-flex items-center gap-1.5 px-2.5 py-1 leading-none',
				meta.badgeClass,
			)}
		>
			<Icon aria-hidden className={cn('h-3.5 w-3.5', meta.iconClass)} />
			{meta.label}
		</Badge>
	)
}
