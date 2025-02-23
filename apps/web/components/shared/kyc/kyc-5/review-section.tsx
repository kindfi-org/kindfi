'use client'
import { Button } from '~/components/base/button'
import type { ReviewSectionProps } from './types'

export default function ReviewSection({
	title,
	children,
	onEdit,
}: ReviewSectionProps) {
	return (
		<div className="space-y-4 pb-6 border-b last:border-b-0">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">{title}</h3>
				<Button variant="ghost" size="sm" onClick={onEdit}>
					Edit
				</Button>
			</div>
			{children}
		</div>
	)
}
