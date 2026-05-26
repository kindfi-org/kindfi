'use client'

import { motion } from 'framer-motion'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '~/components/base/button'
import { useI18n } from '~/lib/i18n'
import { cn } from '~/lib/utils'

type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
	viewMode: ViewMode
	onViewModeChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
	const { t } = useI18n()

	return (
		<div
			className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1"
			role="radiogroup"
			aria-label={t('projects.view')}
		>
			{(['grid', 'list'] as const).map((mode) => {
				const isActive = viewMode === mode
				const Icon = mode === 'grid' ? LayoutGrid : List
				return (
					<Button
						key={mode}
						variant="ghost"
						size="sm"
						onClick={() => onViewModeChange(mode)}
						className={cn(
							'relative h-9 rounded-full px-3',
							isActive ? 'text-emerald-800' : 'text-slate-500',
						)}
						aria-label={mode === 'grid' ? t('projects.grid') : t('projects.list')}
						aria-checked={isActive}
						role="radio"
					>
						{isActive ? (
							<motion.div
								layoutId="projectsViewModeIndicator"
								className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-slate-200/80"
								initial={false}
								transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
							/>
						) : null}
						<Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
					</Button>
				)
			})}
		</div>
	)
}
