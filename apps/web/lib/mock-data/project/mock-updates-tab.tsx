/**
 * @description      : mock update tab
 * @author           : pheobeayo
 * @group            : ODhack 12 contributor
 * @created          : 25/03/2025 - 10:40:49
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/03/2025
 * - Author          : pheobeayo
 * - Modification    : fixed the update tab section in the Project Details
 **/
import type { UpdateItem } from '~/lib/types/project/update-tab-section.types'

export const updateItems: UpdateItem[] = [
	{
		id: '1',
		likes: '6',
		comments: '2',
		title: 'Professional Vote Qnetic #1 Investment Opportunity',
		author: {
			name: 'Joyce Zhou',
			avatar: '/avatar/joyce.svg',
		},
		date: 'March 19',
		description:
			'We are excited to announce that Qnetic has been voted the #1 investment opportunity by a panel of industry professionals at the recent CleanTech Innovation Summit ...',
		readMoreUrl: '/updates/professionals-vote-qnetic',
	},
	{
		id: '2',
		likes: '5',
		comments: '1',
		title: 'Milestone Achieved: 40% Scale Prototype Successfully Tested',
		author: {
			name: 'Michael Chen',
			avatar: '/avatars/michael.svg',
		},
		date: 'March 10',
		description:
			"Today marks a significant milestone for our team as we've successfully completed testing of our 40% scale prototype. The results have exceeded our expectations...",
		readMoreUrl: '/updates/milestones-achieved',
	},
	{
		id: '3',
		likes: '4',
		comments: '0',
		title: 'New Partnership Announcement with Leading Energy Provider',
		author: {
			name: 'Sarah Williams',
			avatar: '/avatar/sarah.svg',
		},
		date: 'Feb 28',
		description:
			"We're thrilled to announce our new strategic partnership with GreenPower Inc., one of the leading renewable energy providers in North America...",
		readMoreUrl: '/updates/new-partnership-announcement',
	},
]
