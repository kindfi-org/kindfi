import type { Testimonial } from '~/lib/types/impact/testimonial'

export const testimonials: Testimonial[] = [
	{
		id: 'maria',
		name: 'Maria Rodriguez',
		role: 'Teacher',
		location: 'Costa Rica',
		quote:
			'The impact of this initiative has been transformative for our students. We now have modern learning tools that were previously just a dream.',
		image: '/placeholder.svg?height=100&width=100',
	},
	{
		id: 'john',
		name: 'John Kamau',
		role: 'Community Leader',
		location: 'Kenya',
		quote:
			'Clean water access has changed everything for our village. The transparent funding process gave us confidence throughout the project.',
		image: '/placeholder.svg?height=100&width=100',
	},
	{
		id: 'priya',
		name: 'Priya Sharma',
		role: 'Project Manager',
		location: 'India',
		quote:
			"The blockchain verification system made it easy to track and prove our project's impact. Donors could see their contributions at work.",
		image: '/placeholder.svg?height=100&width=100',
	},
]
