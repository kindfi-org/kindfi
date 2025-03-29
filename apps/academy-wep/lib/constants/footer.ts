import type { FooterRoutes } from '../types/footer'

export const footerRoutes: FooterRoutes = {
	projects: [
		{ name: 'Social Projects', href: '/social-projects' },
		{ name: 'Start a Campaign', href: '/start-campaign' },
		{ name: 'Featured Projects', href: '/featured-projects' },
		{ name: 'Recent Investments', href: '/recent-investments' },
	],
	resources: [
		{ name: 'Trustless Work', href: '/trustless-work' },
		{ name: 'Documentation', href: '/documentation' },
		{ name: 'Tutorials', href: '/tutorials' },
		{ name: 'FAQs', href: '/faqs' },
	],
	legal: [
		{ name: 'Terms of Use', href: '/terms' },
		{ name: 'Privacy Policy', href: '/privacy' },
		{ name: 'Cookie Policy', href: '/cookies' },
		{ name: 'Licenses', href: '/licenses' },
	],
}
