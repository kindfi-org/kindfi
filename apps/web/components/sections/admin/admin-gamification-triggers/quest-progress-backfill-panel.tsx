'use client'

import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'

type BackfillResponse = {
	success: boolean
	summary?: {
		usersProcessed: number
		questsUpdated: number
		chainSynced: number
		chainFailed: number
		errors: string[]
	}
	error?: string
}

async function runBackfill(body: { userId?: string; all?: boolean; limit?: number }) {
	const response = await fetch('/api/admin/gamification/backfill-quests', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
	const json = (await response.json()) as BackfillResponse
	if (!response.ok) {
		throw new Error(json.error || `Request failed (${response.status})`)
	}
	return json
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="space-y-2">
			<Label>{label}</Label>
			{children}
		</div>
	)
}

export function QuestProgressBackfillPanel() {
	const [userId, setUserId] = useState('')
	const [limit, setLimit] = useState('100')

	const mutation = useMutation({
		mutationFn: runBackfill,
		onSuccess: (data) => {
			const summary = data.summary
			if (!summary) return
			toast.success('Quest progress backfill complete', {
				description: `${summary.usersProcessed} users · ${summary.questsUpdated} DB updates · ${summary.chainSynced} on-chain syncs`,
			})
			if (summary.errors.length > 0) {
				toast.message(`${summary.errors.length} backfill warning(s)`, {
					description: summary.errors.slice(0, 2).join(' · '),
				})
			}
		},
		onError: (error) => {
			toast.error('Backfill failed', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		},
	})

	return (
		<div className="mt-6 space-y-4 rounded-lg border border-dashed border-border p-4">
			<div>
				<p className="text-sm font-medium">Backfill from donations</p>
				<p className="text-sm text-muted-foreground">
					Recompute quest progress from contribution history (Supabase + on-chain). Use for users
					who donated before quest sync was fixed.
				</p>
			</div>
			<Field label="User ID (optional)">
				<Input
					placeholder="Supabase profile UUID — leave empty to backfill all donors"
					value={userId}
					onChange={(e) => setUserId(e.target.value)}
					className="font-mono text-sm"
				/>
			</Field>
			<Field label="Max users (when backfilling all)">
				<Input
					type="number"
					min={1}
					max={500}
					value={limit}
					onChange={(e) => setLimit(e.target.value)}
				/>
			</Field>
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					variant="secondary"
					disabled={mutation.isPending || !userId.trim()}
					onClick={() =>
						mutation.mutate({ userId: userId.trim(), all: false, limit: Number(limit) || 100 })
					}
				>
					{mutation.isPending ? 'Running…' : 'Backfill one user'}
				</Button>
				<Button
					type="button"
					variant="outline"
					disabled={mutation.isPending}
					onClick={() => mutation.mutate({ all: true, limit: Number(limit) || 100 })}
				>
					{mutation.isPending ? 'Running…' : 'Backfill all donors'}
				</Button>
			</div>
		</div>
	)
}
