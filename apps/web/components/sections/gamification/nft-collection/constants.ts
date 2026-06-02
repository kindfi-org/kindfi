export const TIERS = {
	bronze: {
		label: 'Bronze',
		color: 'bg-orange-100 text-orange-700 border-orange-300',
		accent: '#CD7F32',
		minPts: 0,
		nextPts: 100,
		votes: 1,
	},
	silver: {
		label: 'Silver',
		color: 'bg-gray-100 text-gray-700 border-gray-300',
		accent: '#C0C0C0',
		minPts: 100,
		nextPts: 500,
		votes: 3,
	},
	gold: {
		label: 'Gold',
		color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
		accent: '#FFD700',
		minPts: 500,
		nextPts: 2000,
		votes: 5,
	},
	diamond: {
		label: 'Diamond',
		color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
		accent: '#B9F2FF',
		minPts: 2000,
		nextPts: null,
		votes: 10,
	},
} as const

export type Tier = keyof typeof TIERS
