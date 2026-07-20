export const REPUTATION_EVENTS = [
	{ value: '0', label: 'Donation (10 pts)' },
	{ value: '1', label: 'Streak Donation (25 pts)' },
	{ value: '2', label: 'Successful Referral (50 pts)' },
	{ value: '3', label: 'New Category Donation (15 pts)' },
	{ value: '4', label: 'New Campaign Donation (5 pts)' },
	{ value: '5', label: 'Quest Completion (30 pts)' },
	{ value: '6', label: 'Boosted Project (20 pts)' },
	{ value: '7', label: 'Outstanding Booster (100 pts)' },
] as const

export const MODULES = [
	{ id: 'streak', label: 'Streak' },
	{ id: 'referral', label: 'Referral' },
	{ id: 'quest', label: 'Quest' },
	{ id: 'nft', label: 'NFT' },
	{ id: 'reputation', label: 'Reputation' },
	{ id: 'governance', label: 'Governance' },
] as const
