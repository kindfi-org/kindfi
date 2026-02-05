'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useSession } from 'next-auth/react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { getUserFoundations } from '~/lib/queries/foundations/get-user-foundations'

interface FoundationSelectProps {
	value?: string
	onChange: (value: string) => void
}

export function FoundationSelect({ value, onChange }: FoundationSelectProps) {
	const { data: session } = useSession()

	const { data: foundations = [], isLoading } = useSupabaseQuery(
		'user-foundations',
		(client) => {
			if (!session?.user?.id) return Promise.resolve([])
			return getUserFoundations(client, session.user.id)
		},
		{
			enabled: !!session?.user?.id,
			additionalKeyValues: [session?.user?.id],
		},
	)

	if (!session?.user?.id) {
		return null
	}

	if (isLoading) {
		return (
			<Select disabled>
				<SelectTrigger>
					<SelectValue placeholder="Loading foundations..." />
				</SelectTrigger>
			</Select>
		)
	}

	if (foundations.length === 0) {
		return (
			<div className="text-sm text-muted-foreground">
				No foundations found. Create one from your profile to assign campaigns.
			</div>
		)
	}

	return (
		<Select value={value || ''} onValueChange={onChange}>
			<SelectTrigger className="border-green-600 bg-white">
				<SelectValue placeholder="Select a foundation (optional)" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="">None (Independent Campaign)</SelectItem>
				{foundations.map((foundation) => (
					<SelectItem key={foundation.id} value={foundation.id}>
						{foundation.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
