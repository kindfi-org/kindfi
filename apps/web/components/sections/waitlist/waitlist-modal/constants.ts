import { Building2, HandHeart, Handshake } from 'lucide-react'
import type { WaitlistRole } from '~/lib/types/waitlist.types'

export const TOTAL_STEPS = 3

export const ROLE_OPTIONS: Array<{
	value: WaitlistRole
	icon: typeof Building2
	labelKey: string
	descriptionKey: string
}> = [
	{
		value: 'project_creator',
		icon: Building2,
		labelKey: 'waitlist.roles.projectCreator',
		descriptionKey: 'waitlist.roles.projectCreatorDesc',
	},
	{
		value: 'supporter',
		icon: HandHeart,
		labelKey: 'waitlist.roles.supporter',
		descriptionKey: 'waitlist.roles.supporterDesc',
	},
	{
		value: 'partner',
		icon: Handshake,
		labelKey: 'waitlist.roles.partner',
		descriptionKey: 'waitlist.roles.partnerDesc',
	},
]
