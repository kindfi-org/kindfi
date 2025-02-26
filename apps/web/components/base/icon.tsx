import {
	BadgeDollarSign,
	Banknote,
	CheckCircle,
	Clock,
	FileCode,
	Globe,
	Lock,
	type LucideIcon,
	Network,
	Shield,
	Star,
	Users,
} from 'lucide-react'
import { cn } from '~/lib/utils'

const icons: Record<string, LucideIcon> = {
	lock: Lock,
	shield: Shield,
	users: Users,
	globe: Globe,
	'check-circle': CheckCircle,
	star: Star,
	banknote: Banknote,
	clock: Clock,
	'file-code': FileCode,
	'badge-dollar-sign': BadgeDollarSign,
	network: Network,
}

interface IconProps {
	name: keyof typeof icons
	className?: string
}

const Icon = ({ name, className }: IconProps) => {
	const LucideComponent = icons[name] || Lock
	return <LucideComponent className={cn('w-6 h-6', className)} />
}

export default Icon
