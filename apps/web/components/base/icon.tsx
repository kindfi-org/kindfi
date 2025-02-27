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
import * as React from 'react'
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

/**
 * Icon component for rendering Lucide icons dynamically.
 *
 * @component
 * @param {IconProps} props - The properties for the Icon component.
 * @param {keyof typeof icons} props.name - The name of the icon.
 * @param {string} [props.className] - Additional CSS classes for styling.
 * @returns {JSX.Element} The rendered icon component.
 */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
	({ name, className }, ref) => {
		const LucideComponent = icons[name] || Lock
		return (
			<LucideComponent
				ref={ref}
				className={cn(
					'w-6 h-6', // Mantiene el tamaño original
					'md:w-7 md:h-7 lg:w-8 lg:h-8', // Ajustes solo en pantallas más grandes
					className,
				)}
			/>
		)
	},
)

Icon.displayName = 'Icon'

export { Icon }
