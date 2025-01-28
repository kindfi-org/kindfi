export interface CommunityBenefit {
	id: string
	icon: 'Users' | 'TrendingUp' | 'Shield' | 'Rocket'
	text: string
}

export interface CommunityTestimonial {
	quote: string
	author: string
	role: string
	imageUrl: string
}

export interface CommunityContent {
	title: {
		main: string
		highlight: string
	}
	description: string
	benefits: CommunityBenefit[]
	testimonial: CommunityTestimonial
}
