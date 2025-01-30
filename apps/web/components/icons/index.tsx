import {
	Apple,
	Building2,
	Cloud,
	Droplet,
	GraduationCap,
	Heart,
	Home,
	Leaf,
	type LucideIcon,
	Users,
	Zap,
} from 'lucide-react'

export const ProjectIcons: Record<string, LucideIcon> = {
	sustainability: Leaf,
	education: GraduationCap,
	healthcare: Heart,
	climate: Cloud,
	equality: Users,
	food: Apple,
	water: Droplet,
	energy: Zap,
	poverty: Home,
	community: Building2,
}

export type ProjectIconType = keyof typeof ProjectIcons
