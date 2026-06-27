'use client'

import { useSupabaseQuery } from '@packages/lib/hooks'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { IoAddOutline, IoMegaphoneOutline, IoOpenOutline, IoTrashOutline } from 'react-icons/io5'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '~/components/base/alert-dialog'
import { Badge } from '~/components/base/badge'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { UserAvatar } from '~/components/base/user-avatar'
import { UpdateForm } from '~/components/sections/project/update/update-form'
import { useProjectUpdatesMutation } from '~/hooks/projects/use-project-updates-mutation'
import { getProjectUpdatesForManage } from '~/lib/queries/projects/get-project-updates-for-manage'

type UpdateFormData = {
	id?: string
	title?: string
	content: string
}

export function ProjectUpdatesManage() {
	const params = useParams()
	const projectSlug = params?.slug as string
	const [isCreating, setIsCreating] = useState(false)
	const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
	const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null)

	const { data, isLoading } = useSupabaseQuery(
		'project-updates-manage',
		(client) => getProjectUpdatesForManage(client, projectSlug),
		{ additionalKeyValues: [projectSlug] },
	)

	const { createUpdate, editUpdate, deleteUpdate, isPending } = useProjectUpdatesMutation()

	const projectId = data?.projectId
	const updates = data?.updates ?? []
	const editingUpdate = updates.find((update) => update.id === editingUpdateId)

	const handleCreate = async (formData: UpdateFormData) => {
		if (!projectId) return

		await createUpdate.mutateAsync({
			projectId,
			projectSlug,
			title: formData.title,
			content: formData.content,
		})
		setIsCreating(false)
	}

	const handleEdit = async (formData: UpdateFormData) => {
		if (!projectId || !editingUpdateId) return

		await editUpdate.mutateAsync({
			projectId,
			projectSlug,
			updateId: editingUpdateId,
			title: formData.title,
			content: formData.content,
		})
		setEditingUpdateId(null)
	}

	const handleDelete = async () => {
		if (!projectId || !deletingUpdateId) return

		await deleteUpdate.mutateAsync({
			projectId,
			projectSlug,
			updateId: deletingUpdateId,
		})
		setDeletingUpdateId(null)
	}

	return (
		<div className="relative">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="space-y-8"
			>
				<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-3 text-white shadow-sm">
							<IoMegaphoneOutline size={24} />
						</div>
						<div>
							<h1 className="text-4xl font-bold tracking-tight gradient-text md:text-5xl">
								Project Updates
							</h1>
							<p className="mt-2 max-w-2xl text-lg text-muted-foreground">
								Share progress, milestones, and news with supporters. Updates appear on your public
								project page.
							</p>
						</div>
					</div>

					<Button variant="outline" asChild className="shrink-0">
						<Link href={`/projects/${projectSlug}`} target="_blank" rel="noopener noreferrer">
							View public page
							<IoOpenOutline className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</header>

				{isCreating ? (
					<UpdateForm
						onSubmit={handleCreate}
						onCancel={() => setIsCreating(false)}
						isSubmitting={createUpdate.isPending}
					/>
				) : editingUpdate ? (
					<UpdateForm
						update={{
							id: editingUpdate.id,
							title: editingUpdate.title,
							content: editingUpdate.content,
						}}
						onSubmit={handleEdit}
						onCancel={() => setEditingUpdateId(null)}
						isSubmitting={editUpdate.isPending}
					/>
				) : (
					<Button
						onClick={() => setIsCreating(true)}
						variant="primary-gradient"
						startIcon={<IoAddOutline />}
						disabled={!projectId || isLoading}
					>
						Post update
					</Button>
				)}

				<Card className="border border-border bg-card shadow-sm">
					<CardHeader>
						<div className="flex items-center justify-between gap-3">
							<div>
								<CardTitle className="text-2xl font-semibold">Published updates</CardTitle>
								<CardDescription>
									{updates.length === 0
										? 'No updates yet. Post your first update to keep supporters informed.'
										: `${updates.length} update${updates.length === 1 ? '' : 's'} visible on the Updates tab.`}
								</CardDescription>
							</div>
							{updates.length > 0 ? <Badge variant="secondary">{updates.length}</Badge> : null}
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{isLoading ? (
							<p className="text-sm text-muted-foreground">Loading updates...</p>
						) : updates.length === 0 ? (
							<p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
								Supporters will see your updates on the project&apos;s Updates tab.
							</p>
						) : (
							updates.map((update) => (
								<article
									key={update.id}
									className="rounded-xl border border-border bg-background p-5 shadow-sm"
								>
									<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
										<div className="min-w-0 flex-1 space-y-3">
											<div className="flex items-center gap-3">
												<UserAvatar
													src={update.author.avatar}
													alt={update.author.name}
													name={update.author.name}
												/>
												<div>
													<p className="text-sm font-medium">{update.author.name}</p>
													<p className="text-xs text-muted-foreground">
														{formatDistanceToNow(new Date(update.date), { addSuffix: true })}
													</p>
												</div>
											</div>
											<div>
												<h2 className="text-lg font-semibold">{update.title}</h2>
												<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
													{update.content}
												</p>
											</div>
										</div>

										<div className="flex shrink-0 gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setIsCreating(false)
													setEditingUpdateId(update.id)
												}}
												disabled={isPending}
											>
												Edit
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="text-destructive hover:text-destructive"
												onClick={() => setDeletingUpdateId(update.id)}
												disabled={isPending}
												startIcon={<IoTrashOutline />}
											>
												Delete
											</Button>
										</div>
									</div>
								</article>
							))
						)}
					</CardContent>
				</Card>
			</motion.div>

			<AlertDialog
				open={Boolean(deletingUpdateId)}
				onOpenChange={(open) => !open && setDeletingUpdateId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this update?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. The update will be removed from your public project
							page.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteUpdate.isPending}
						>
							{deleteUpdate.isPending ? 'Deleting...' : 'Delete update'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
