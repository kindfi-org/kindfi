'use client'

import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { IoAddOutline, IoOpenOutline, IoTrashOutline } from 'react-icons/io5'
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
import { ManageSectionShell } from '~/components/sections/projects/manage/manage-section-shell'
import { useManagedProjectQuery } from '~/hooks/projects/use-managed-project-query'
import { useProjectUpdatesMutation } from '~/hooks/projects/use-project-updates-mutation'
import { useI18n } from '~/lib/i18n/context'
import type { getProjectUpdatesForManage } from '~/lib/queries/projects/get-project-updates-for-manage'

type UpdateFormData = {
	id?: string
	title?: string
	content: string
}

export function ProjectUpdatesManage() {
	const { t } = useI18n()
	const params = useParams()
	const projectSlug = params?.slug as string
	const [isCreating, setIsCreating] = useState(false)
	const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
	const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null)

	const { data, isLoading } = useManagedProjectQuery<
		Awaited<ReturnType<typeof getProjectUpdatesForManage>>
	>('project-updates-manage', projectSlug, 'updates', { additionalKeyValues: [projectSlug] })

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

	const publishedDescription =
		updates.length === 0
			? t('projects.manage.updatesEmptyHint')
			: t('projects.manage.updatesCount')
					.replace('{count}', String(updates.length))
					.replace('{plural}', updates.length === 1 ? '' : 's')

	return (
		<>
			<ManageSectionShell
				title={t('projects.manage.updatesTitle')}
				description={t('projects.manage.updatesDescription')}
				actions={
					<Button variant="outline" size="sm" asChild>
						<Link href={`/projects/${projectSlug}`} target="_blank" rel="noopener noreferrer">
							{t('projects.manage.viewPublicPage')}
							<IoOpenOutline className="ml-2 h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				}
			>
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
						startIcon={<IoAddOutline />}
						disabled={!projectId || isLoading}
					>
						{t('projects.manage.postUpdate')}
					</Button>
				)}

				<Card className="border-border">
					<CardHeader>
						<div className="flex items-center justify-between gap-3">
							<div>
								<CardTitle className="text-lg font-semibold">
									{t('projects.manage.publishedUpdates')}
								</CardTitle>
								<CardDescription>{publishedDescription}</CardDescription>
							</div>
							{updates.length > 0 ? <Badge variant="secondary">{updates.length}</Badge> : null}
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						{isLoading ? (
							<p className="text-sm text-muted-foreground">{t('projects.manage.loadingUpdates')}</p>
						) : updates.length === 0 ? (
							<p className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
								{t('projects.manage.updatesEmptySupporters')}
							</p>
						) : (
							updates.map((update) => (
								<article
									key={update.id}
									className="rounded-lg border border-border bg-background p-4 sm:p-5"
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
												<h2 className="text-base font-semibold">{update.title}</h2>
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
												{t('projects.manage.edit')}
											</Button>
											<Button
												variant="outline"
												size="sm"
												className="text-destructive hover:text-destructive"
												onClick={() => setDeletingUpdateId(update.id)}
												disabled={isPending}
												startIcon={<IoTrashOutline />}
											>
												{t('projects.manage.delete')}
											</Button>
										</div>
									</div>
								</article>
							))
						)}
					</CardContent>
				</Card>
			</ManageSectionShell>

			<AlertDialog
				open={Boolean(deletingUpdateId)}
				onOpenChange={(open) => {
					if (!open) setDeletingUpdateId(null)
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('projects.manage.deleteUpdateTitle')}</AlertDialogTitle>
						<AlertDialogDescription>
							{t('projects.manage.deleteUpdateDescription')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('projects.manage.cancel')}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteUpdate.isPending}
						>
							{deleteUpdate.isPending
								? t('projects.manage.deleting')
								: t('projects.manage.deleteUpdate')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
