// apps/web/constants/sections/hero/data.ts
import type { HeroContent } from './types'

export const heroContent: HeroContent = {
	title: 'Revolutionizing Social Impact',
	subtitle: 'Support Social Causes Using Web3',
	description:
		'Every contribution fuels real-world impact. You can support social causes through crypto donations to escrows and unlock exclusive NFTs. KindFi is driving the adoption of Web3 technology for a more connected and empowered world where everyone can make a difference.',
	cta: {
		primary: 'Support with Crypto',
		secondary: 'Explore Causes',
	},
	categories: [
		{
			id: 'empowering-communities-id',
			icon: 'Rocket',
			label: 'Empowering Communities',
			color:
				'bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 border-teal-200/50',
		},
		{
			id: 'environmental-projects-id',
			icon: 'Leaf',
			label: 'Environmental Projects',
			color:
				'bg-green-50/80 text-green-700 hover:bg-green-100/80 border-green-200/50',
		},
		{
			id: 'animal-shelters-id',
			icon: 'Heart',
			label: 'Animal Shelters',
			color:
				'bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 border-rose-200/50',
		},
		{
			id: 'community-news-id',
			icon: 'NewspaperIcon',
			label: 'Community News Initiatives',
			color:
				'bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 border-slate-200/50',
		},
	],
	secondaryCategories: [
		{
			id: 'healthcare-support-id',
			icon: 'Stethoscope',
			label: 'Healthcare Support',
			color: 'border-cyan-200/50 text-cyan-700 hover:bg-cyan-50/80',
		},
		{
			id: 'food-security-id',
			icon: 'UtensilsCrossed',
			label: 'Food Security Campaigns',
			color: 'border-orange-200/50 text-orange-700 hover:bg-orange-50/80',
		},
		{
			id: 'child-welfare-id',
			icon: 'Baby',
			label: 'Child Welfare Programs',
			color: 'border-purple-200/50 text-purple-700 hover:bg-purple-50/80',
		},
		{
			id: 'sustainable-agriculture-id',
			icon: 'Sprout',
			label: 'Sustainable Agriculture',
			color: 'border-emerald-200/50 text-emerald-700 hover:bg-emerald-50/80',
		},
		{
			id: 'social-finance-id',
			icon: 'Coins',
			label: 'Social Finance & Innovation',
			color: 'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 border-sky-200/50',
		},
		{
			id: 'education-for-all-id',
			icon: 'GraduationCap',
			label: 'Education for All',
			color:
				'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50',
		},
		{
			id: 'disaster-relief-id',
			icon: 'HandHelping',
			label: 'Disaster Relief Efforts',
			color: 'bg-red-50/80 text-red-700 hover:bg-red-100/80 border-red-200/50',
		},
	],
	stats: [
		{
			id: 'inversiones-exitosas-id',
			value: '250+',
			label: 'Inversiones Exitosas',
			icon: 'LineChart',
		},
		{
			id: 'proyectos-financiados-id',
			value: '3,325',
			label: 'Proyectos Financiados',
			icon: 'Rocket',
		},
		{
			id: 'capital-total-invertido-id',
			value: '$720M',
			label: 'Capital Total Invertido',
			icon: 'Coins',
			highlight: true,
		},
	],
}
