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
		badgeClass: 'bg-amber-100 text-amber-800',
	},
	editor: {
		label: 'Editor',
		icon: Edit,
		iconClass: 'text-blue-500',
		badgeClass: 'bg-blue-100 text-blue-800',
	},
	advisor: {
		label: 'Advisor',
		icon: UserCheck,
		iconClass: 'text-teal-500',
		badgeClass: 'bg-teal-100 text-teal-800',
	},
	community: {
		label: 'Community',
		icon: Users,
		iconClass: 'text-green-500',
		badgeClass: 'bg-green-100 text-green-800',
	},
	core: {
		label: 'Core',
		icon: ShieldCheck,
		iconClass: 'text-purple-500',
		badgeClass: 'bg-purple-100 text-purple-800',
	},
	others: {
		label: 'Other',
		icon: Puzzle,
		iconClass: 'text-gray-500',
		badgeClass: 'bg-gray-100 text-gray-800',
	},
}
