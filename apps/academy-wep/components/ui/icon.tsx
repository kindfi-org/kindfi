'use client'

import type { LucideIcon } from 'lucide-react'

import { Bolt, Shield, Table2Icon, Zap } from 'lucide-react' // Importing Lucide icons

interface IconProps {
	name: string
	className?: string
}

const Icon = ({ name, className }: IconProps) => {
	const icons: { [key: string]: LucideIcon } = {
		shield: Shield,
		bolt: Bolt,
		table2: Table2Icon,
		zap: Zap,
		// Add more icons as needed
	}

	const IconComponent = icons[name]

	return IconComponent ? <IconComponent className={className} /> : null
}

export { Icon }
