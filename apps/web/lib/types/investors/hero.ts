export interface InvestorStat {
	label: string
	value: string
}

export interface InvestorTag {
	icon: string
	label: string
}

export interface HeroInvestor {
	id: number
	name: string
	profileImg: string
	badge: string
	level: string
	stats: InvestorStat[]
	tags: InvestorTag[]
}
