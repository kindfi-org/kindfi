import type { Enums } from '@services/supabase'
import {
	Crown,
	Edit,
	type LucideIcon,
	Puzzle,
	ShieldCheck,
	UserCheck,
	Users,
} from 'lucide-react'

interface MemberRoleMeta {
	label: string
	icon: LucideIcon
	iconClass: string
	badgeClass: string
}

export const memberRole: Record<
	Enums<'project_member_role'>,
	MemberRoleMeta
> = {
	admin: {
		label: 'Admin',
		icon: Crown,
		iconClass: 'text-amber-500',
		badgeClass:
			'bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900',
	},
	editor: {
		label: 'Editor',
		icon: Edit,
		iconClass: 'text-blue-500',
		badgeClass:
			'bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900',
	},
	advisor: {
		label: 'Advisor',
		icon: UserCheck,
		iconClass: 'text-teal-500',
		badgeClass:
			'bg-teal-100 text-teal-800 hover:bg-teal-200 hover:text-teal-900',
	},
	community: {
		label: 'Community',
		icon: Users,
		iconClass: 'text-green-500',
		badgeClass:
			'bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900',
	},
	core: {
		label: 'Core',
		icon: ShieldCheck,
		iconClass: 'text-purple-500',
		badgeClass:
			'bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900',
	},
	others: {
		label: 'Other',
		icon: Puzzle,
		iconClass: 'text-zinc-500',
		badgeClass:
			'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 hover:text-zinc-900',
	},
}
