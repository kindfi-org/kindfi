'use client'

import { BarChart2 } from 'lucide-react'
import { Card } from '~/components/base/card'
import { useGlowEffect } from '~/hooks/use-glow-effect'

export default function ImpactCard() {
	const cardRef = useGlowEffect()

	return (
		<Card
			ref={cardRef}
			className="p-6 max-w-sm glow-card relative overflow-hidden"
		>
			<div className="absolute inset-0 pointer-events-none glow-effect" />
			<div className="flex justify-between items-start relative z-10">
				<div className="space-y-2">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Impact Generated</p>
						<h2 className="text-2xl font-semibold tracking-tight">
							$12,890.50
						</h2>
					</div>
					<p className="text-sm text-muted-foreground">
						Supporting 12 active projects
					</p>
				</div>
				<BarChart2 className="h-4 w-4 text-green-500" />
			</div>
		</Card>
	)
}
