'use client'

import { motion } from 'framer-motion'
import { cn } from '~/lib/utils'

interface AboutSectionHeaderProps {
	id?: string
	title: string
	titleHighlight?: string
	subtitle?: string
	className?: string
}

export function AboutSectionHeader({
	id,
	title,
	titleHighlight,
	subtitle,
	className,
}: AboutSectionHeaderProps) {
	return (
		<motion.div
			className={cn('mx-auto mb-10 max-w-3xl text-center sm:mb-14', className)}
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
			viewport={{ once: true, amount: 0.2 }}
		>
			<h2 id={id} className="mb-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
				{titleHighlight ? (
					<>
						{title} <span className="gradient-text">{titleHighlight}</span>
					</>
				) : (
					title
				)}
			</h2>
			{subtitle ? (
				<p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>
			) : null}
		</motion.div>
	)
}
