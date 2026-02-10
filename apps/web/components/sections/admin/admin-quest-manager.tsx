'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
	IoAddOutline,
	IoCheckmarkCircleOutline,
	IoCloseCircleOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { Input } from '~/components/base/input'
import { Label } from '~/components/base/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/base/select'
import { Textarea } from '~/components/base/textarea'
import { toast } from 'sonner'

type QuestType =
	| 'multi_region_donation'
	| 'weekly_streak'
	| 'multi_category_donation'
	| 'referral_quest'
	| 'total_donation_amount'
	| 'quest_master'

const QUEST_TYPE_LABELS: Record<QuestType, string> = {
	multi_region_donation: 'Multi-Region Donation',
	weekly_streak: 'Weekly Streak',
	multi_category_donation: 'Multi-Category Donation',
	referral_quest: 'Referral Quest',
	total_donation_amount: 'Total Donation Amount',
	quest_master: 'Quest Master',
}

export function AdminQuestManager() {
	const queryClient = useQueryClient()
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [formData, setFormData] = useState({
		quest_type: 'total_donation_amount' as QuestType,
		name: '',
		description: '',
		target_value: '',
		reward_points: '',
		expires_at: '',
	})

	const { data: questsData, isLoading } = useSupabaseQuery(
		'quests',
		async (supabase) => {
			const { data, error } = await supabase
				.from('quest_definitions')
				.select('*')
				.order('quest_id', { ascending: true })

			if (error) throw error
			return { quests: data || [] }
		},
	)

	const createQuestMutation = useMutation({
		mutationFn: async (quest: {
			quest_type: QuestType
			name: string
			description: string
			target_value: number
			reward_points: number
			expires_at: string | null
		}) => {
			const response = await fetch('/api/quests', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(quest),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || 'Failed to create quest')
			}

			return response.json()
		},
		onSuccess: async (data) => {
			toast.success('Quest created', {
				description: `Quest "${data.quest.name}" has been created successfully.`,
			})
			setIsCreateDialogOpen(false)
			setFormData({
				quest_type: 'total_donation_amount',
				name: '',
				description: '',
				target_value: '',
				reward_points: '',
				expires_at: '',
			})
			queryClient.invalidateQueries({ queryKey: ['supabase', 'quests'] })
		},
		onError: (error: Error) => {
			toast.error('Error creating quest', {
				description: error.message,
			})
		},
	})

	const handleCreateQuest = () => {
		if (!formData.name || !formData.description || !formData.target_value) {
			toast.error('Validation error', {
				description: 'Please fill in all required fields.',
			})
			return
		}

		createQuestMutation.mutate({
			quest_type: formData.quest_type,
			name: formData.name,
			description: formData.description,
			target_value: parseInt(formData.target_value, 10),
			reward_points: parseInt(formData.reward_points || '0', 10),
			expires_at: formData.expires_at || null,
		})
	}

	const quests = questsData?.quests || []

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold">Quest Definitions</h2>
					<p className="text-sm text-muted-foreground">
						Create and manage quests that users can complete to earn rewards.
					</p>
				</div>
				<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
					<DialogTrigger asChild>
						<Button>
							<IoAddOutline className="mr-2 h-4 w-4" />
							Create Quest
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Create New Quest</DialogTitle>
							<DialogDescription>
								Create a new quest that users can complete to earn rewards.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="quest_type">Quest Type *</Label>
								<Select
									value={formData.quest_type}
									onValueChange={(value) =>
										setFormData({ ...formData, quest_type: value as QuestType })
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Object.entries(QUEST_TYPE_LABELS).map(([value, label]) => (
											<SelectItem key={value} value={value}>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="name">Quest Name *</Label>
								<Input
									id="name"
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									placeholder="e.g., First Donation"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Description *</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									placeholder="e.g., Make your first donation to any project"
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="target_value">Target Value *</Label>
									<Input
										id="target_value"
										type="number"
										min="1"
										value={formData.target_value}
										onChange={(e) =>
											setFormData({ ...formData, target_value: e.target.value })
										}
										placeholder="e.g., 1"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="reward_points">Reward Points</Label>
									<Input
										id="reward_points"
										type="number"
										min="0"
										value={formData.reward_points}
										onChange={(e) =>
											setFormData({ ...formData, reward_points: e.target.value })
										}
										placeholder="e.g., 50"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="expires_at">Expiration Date (Optional)</Label>
								<Input
									id="expires_at"
									type="datetime-local"
									value={formData.expires_at}
									onChange={(e) =>
										setFormData({ ...formData, expires_at: e.target.value })
									}
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => setIsCreateDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								onClick={handleCreateQuest}
								disabled={createQuestMutation.isPending}
							>
								{createQuestMutation.isPending ? 'Creating...' : 'Create Quest'}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{isLoading ? (
				<div className="text-center py-8 text-muted-foreground">
					Loading quests...
				</div>
			) : quests.length === 0 ? (
				<Card>
					<CardContent className="py-8 text-center">
						<p className="text-muted-foreground">No quests found.</p>
						<p className="text-sm text-muted-foreground mt-2">
							Create your first quest to get started.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4">
					{quests.map((quest) => (
						<Card key={quest.id}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="flex items-center gap-2">
											{quest.name}
											{quest.is_active ? (
												<Badge variant="default" className="bg-green-600">
													<IoCheckmarkCircleOutline className="mr-1 h-3 w-3" />
													Active
												</Badge>
											) : (
												<Badge variant="secondary">
													<IoCloseCircleOutline className="mr-1 h-3 w-3" />
													Inactive
												</Badge>
											)}
										</CardTitle>
										<CardDescription className="mt-1">
											{quest.description}
										</CardDescription>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="font-medium">Type:</span>{' '}
										{QUEST_TYPE_LABELS[quest.quest_type as QuestType] ||
											quest.quest_type}
									</div>
									<div>
										<span className="font-medium">Target:</span>{' '}
										{quest.target_value}
									</div>
									<div>
										<span className="font-medium">Reward:</span>{' '}
										{quest.reward_points} points
									</div>
									<div>
										<span className="font-medium">Quest ID:</span> {quest.quest_id}
									</div>
								</div>
								{quest.expires_at && (
									<div className="mt-2 text-sm text-muted-foreground">
										<span className="font-medium">Expires:</span>{' '}
										{new Date(quest.expires_at).toLocaleString()}
									</div>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	)
}
