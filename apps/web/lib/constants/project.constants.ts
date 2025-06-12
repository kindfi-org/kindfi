import {
	Cpu,
	GraduationCap,
	Leaf,
	Palette,
	Stethoscope,
	Users,
} from 'lucide-react'
import type { ProjectCategory } from '../types/projects.types'

export const PROJECT_CATEGORIES: ProjectCategory[] = [
	{
		id: 'environment',
		name: 'Environment',
		slug: 'environment',
		label: 'Environment',
		value: 'environment',
		icon: Leaf,
		description: 'Environmental conservation and sustainability initiatives',
		color:
			'bg-green-50/80 text-green-700 hover:bg-green-100/80 border-green-200/50',
	},
	{
		id: 'education',
		name: 'Education',
		slug: 'education',
		label: 'Education',
		value: 'education',
		icon: GraduationCap,
		description: 'Learning, educational access, and development projects',
		color: 'bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 border-sky-200/50',
	},
	{
		id: 'healthcare',
		name: 'Healthcare',
		slug: 'healthcare',
		label: 'Healthcare',
		value: 'healthcare',
		icon: Stethoscope,
		description: 'Medical, wellness, and health accessibility initiatives',
		color: 'bg-red-50/80 text-red-700 hover:bg-red-100/80 border-red-200/50',
	},
	{
		id: 'technology',
		name: 'Technology',
		slug: 'technology',
		label: 'Technology',
		value: 'technology',
		icon: Cpu,
		description: 'Tech innovation and digital access projects',
		color:
			'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50',
	},
	{
		id: 'community',
		name: 'Community',
		slug: 'community',
		label: 'Community',
		value: 'community',
		icon: Users,
		description: 'Community building and social support initiatives',
		color:
			'bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 border-teal-200/50',
	},
	{
		id: 'arts',
		name: 'Arts',
		slug: 'arts',
		label: 'Arts',
		value: 'arts',
		icon: Palette,
		description: 'Creative and cultural expression projects',
		color:
			'bg-purple-50/80 text-purple-700 hover:bg-purple-100/80 border-purple-200/50',
	},
] as const
