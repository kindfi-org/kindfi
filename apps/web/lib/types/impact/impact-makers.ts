export interface ImpactMaker {
	id: string
	name: string
	level: 'Platinum' | 'Gold' | 'Silver'
	image: string
	totalImpact: number
	projectsSupported: number
	badges: string[]
}
