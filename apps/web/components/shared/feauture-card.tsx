import { Check } from 'lucide-react'
import type React from 'react'
import { Card, CardContent } from '~/components/base/card'

export const PlatformFeatureCard = ({
	title,
	description,
	content,
	checkList = [],
}: {
	title: string
	description: string
	content?: React.ReactNode
	checkList?: string[]
}) => {
	return (
		<div className="text-center">
			<Card className="h-full bg-blue-50/50">
				<CardContent className="p-6">
					<h3 className="font-semibold mb-3">{title}</h3>
					<p className="text-sm text-gray-600 mb-4">{description}</p>
					{content && <div className="mb-4">{content}</div>}
					{checkList.length > 0 && (
						<ul className="text-left">
							{checkList.map((item) => (
								<li key={item} className="flex items-center gap-2 mb-2">
									<Check className="w-4 h-4 text-green-600" />
									<span className="text-sm">{item}</span>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
