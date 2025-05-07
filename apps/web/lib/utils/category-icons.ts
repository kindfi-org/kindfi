import {
	Baby,
	Droplets,
	GraduationCap,
	Heart,
	HeartPulse,
	Leaf,
	type LucideIcon,
	Newspaper,
	Palette,
	PawPrint,
	ShieldAlert,
	Users,
} from 'lucide-react'

export const categoryIcons: Record<string, LucideIcon> = {
	'Animal Welfare': PawPrint,
	'Child Welfare': Baby,
	'Environmental Protection': Leaf,
	'Disaster Relief': ShieldAlert,
	'Culture and Arts': Palette,
	'Access to Clean Water': Droplets,
	Education: GraduationCap,
	Healthcare: HeartPulse,
	'Environmental Projects': Leaf,
	'Empowering Communities': Users,
	'Animal Shelters': Heart,
	'Community News': Newspaper,
}
