'use client'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '~/components/base/card'
import type { ExtractedData } from './types'

interface ExtractedDataDisplayProps {
	data: ExtractedData | null
	side: 'front' | 'back'
	isProcessing: boolean
}

export function ExtractedDataDisplay({ data }: ExtractedDataDisplayProps) {
	if (!data?.text) return null

	return (
		<Card className="mt-2">
			<CardContent className="p-4">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<AlertCircle className="h-4 w-4" />
						<h4 className="font-medium text-gray-900">
							Extracted Information:
						</h4>
					</div>
					<div className="text-sm text-gray-600 max-h-[4.5rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
						<p className="whitespace-pre-wrap">{data.text}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
