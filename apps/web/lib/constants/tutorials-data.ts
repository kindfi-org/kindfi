import type { LucideIcon } from 'lucide-react'
import { BookOpen, Building2, CheckCircle2, GitMerge, Landmark, UserPlus } from 'lucide-react'

export type TutorialSectionId = 'gettingStarted' | 'campaigns' | 'donations'

export type TutorialCardId =
	| 'register'
	| 'createCampaign'
	| 'milestones'
	| 'readyForReview'
	| 'donationFlow'
	| 'createFoundation'

export interface TutorialCardConfig {
	id: TutorialCardId
	icon: LucideIcon
	section: TutorialSectionId
	href?: string
}

export const TUTORIAL_SECTION_ORDER: TutorialSectionId[] = [
	'gettingStarted',
	'campaigns',
	'donations',
]

export const TUTORIAL_CARDS: TutorialCardConfig[] = [
	{ id: 'register', icon: UserPlus, section: 'gettingStarted', href: '/sign-up' },
	{ id: 'createCampaign', icon: BookOpen, section: 'campaigns', href: '/create-project' },
	{ id: 'milestones', icon: CheckCircle2, section: 'campaigns' },
	{ id: 'readyForReview', icon: GitMerge, section: 'campaigns' },
	{ id: 'donationFlow', icon: Landmark, section: 'donations', href: '/projects' },
	{ id: 'createFoundation', icon: Building2, section: 'campaigns', href: '/create-foundation' },
]
