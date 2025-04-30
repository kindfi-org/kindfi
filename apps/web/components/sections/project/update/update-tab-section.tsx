'use client'

import { Loader2Icon, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { Button } from '~/components/base/button'
import { createClient } from '~/lib/supabase/client'
import type { UpdateFormValues } from '~/lib/types/project/update-tab-section.types'
import { LoadMoreButton } from './load-more-button'
import { UpdateCard } from './update-card'
import { UpdateForm } from './update-form'

const supabase = createClient()

export function ProjectUpdatesTabSection() {
	const { projectId } = useParams()
	const [isCreatingUpdate, setIsCreatingUpdate] = useState(false)
	const [page, setPage] = useState(1)
	const pageSize = 2

	// Fetch project updates
	const [fetchUpdatesState, fetchUpdates] = useAsyncFn(async () => {
		const { data, error } = await supabase
			.from('project_updates')
			.select('*, user:created_by(name, avatar_url)')
			.eq('project_id', projectId)
			.order('created_at', { ascending: false })
			.range((page - 1) * pageSize, page * pageSize - 1)

		if (error) throw error
		return data
	}, [projectId, page])

	const updates = fetchUpdatesState.value
	const isLoading = fetchUpdatesState.loading
	const error = fetchUpdatesState.error

	// Check if user is a Kindler (project owner)
	const isKindler = true // Placeholder - replace with actual auth logic

	// Mutation for creating a new update
	const [createUpdateState, createUpdate] = useAsyncFn(
		async (newUpdate) => {
			const { error } = await supabase.from('project_updates').insert([
				{
					...newUpdate,
					project_id: projectId,
				},
			])

			if (error) throw error
			await fetchUpdates()
		},
		[projectId],
	)

	// Mutation for updating an existing update
	const [updateUpdateState, updateUpdate] = useAsyncFn(
		async ({ id, ...updateData }) => {
			const { error } = await supabase
				.from('project_updates')
				.update(updateData)
				.eq('id', id)

			if (error) throw error
			await fetchUpdates()
		},
		[projectId],
	)

	// Mutation for deleting an update
	const [deleteUpdateState, deleteUpdate] = useAsyncFn(
		async (id) => {
			const { error } = await supabase
				.from('project_updates')
				.delete()
				.eq('id', id)

			if (error) throw error
			await fetchUpdates()
		},
		[projectId],
	)

	const handleLoadMore = async (): Promise<void> => {
		setPage((prevPage) => prevPage + 1)
	}

	const handleCreateUpdate = (data: UpdateFormValues) => {
		createUpdate(data)
	}

	const handleEditUpdate = (data: UpdateFormValues) => {
		updateUpdate(data)
	}

	const handleDeleteUpdate = (id: string) => {
		deleteUpdate(id)
	}

	// Setup real-time subscription
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Subscribe to changes in the project_updates table for this project
		const channel = supabase
			.channel(`project-updates-${projectId}`)
			.on(
				'postgres_changes',
				{
					event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
					schema: 'public',
					table: 'project_updates',
					filter: `project_id=eq.${projectId}`,
				},
				() => {
					// ! Refactor: This should be handled in a more efficient way
					// e.g., by using the state hook to update the local state and avoid refetching and grabbing the received data.
					// ? fetchUpdates() should be called only when the user change pagination and we must rely in a initialData
					// ? coming form the props, which are the fetch that we do at page.tsx level in the server side...
					// Refetch data when any change occurs
					fetchUpdates() // Refetch the updates
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [projectId])

	return (
		<section
			className="w-full max-w-5xl mx-auto py-10 px-4"
			aria-labelledby="updates-tab-section-title"
		>
			<div className="flex justify-between items-center mb-6">
				<h1 id="updates-tab-section-title" className="text-3xl font-bold">
					Project Updates
				</h1>
				{isKindler && (
					<Button
						onClick={() => setIsCreatingUpdate(true)}
						className="flex items-center gap-2"
					>
						<Plus size={16} />
						Add Update
					</Button>
				)}
			</div>

			{isCreatingUpdate && (
				<UpdateForm
					onSubmit={handleCreateUpdate}
					onCancel={() => setIsCreatingUpdate(false)}
					isSubmitting={createUpdateState.loading}
				/>
			)}

			{isLoading ? (
				<div className="flex justify-center py-10">
					<Loader2Icon className="h-8 w-8 animate-spin text-gray-500" />
				</div>
			) : error ? (
				<div className="text-center py-10 text-red-500">
					Failed to load updates. Please try again.
				</div>
			) : updates?.length === 0 ? (
				<div className="text-center py-10 text-gray-500">
					No updates available yet.
				</div>
			) : (
				<>
					<UpdateCard
						data={updates || []}
						updatesUrl={`/projects/${projectId}/updates`}
						canManageUpdates={isKindler}
						onEdit={handleEditUpdate}
						onDelete={handleDeleteUpdate}
					/>
					{updates && updates.length >= pageSize && (
						<LoadMoreButton onLoadMore={handleLoadMore} />
					)}
				</>
			)}
		</section>
	)
}

// ? Keeping for future reference when the useSupabaseClient is available (query and mutations in the same file... hook is a TanStack Query wrapper)
// Use TanStack Query to fetch project updates
// const {
// 	data: updates,
// 	isLoading,
// 	error,
// 	refetch,
// } = useSupabaseQuery(['projectUpdates', projectId, page], (supabase) =>
// 	supabase
// 		.from('project_updates')
// 		.select('*, user:created_by(name, avatar_url)')
// 		.eq('project_id', projectId)
// 		.order('created_at', { ascending: false })
// 		.range((page - 1) * pageSize, page * pageSize - 1),
// )

// // Check if user is a Kindler (project owner)
// // This would typically come from a user context or auth hook
// const isKindler = true // Placeholder - replace with actual auth logic

// // Mutation for creating a new update
// const createUpdateMutation = useSupabaseMutation(
// 	(supabase, newUpdate) =>
// 		supabase.from('project_updates').insert([
// 			{
// 				...newUpdate,
// 				project_id: projectId,
// 			},
// 		]),
// 	{
// 		onSuccess: () => {
// 			refetch()
// 			setIsCreatingUpdate(false)
// 		},
// 	},
// )

// // Mutation for updating an existing update
// const updateUpdateMutation = useSupabaseMutation(
// 	(supabase, { id, ...updateData }) =>
// 		supabase.from('project_updates').update(updateData).eq('id', id),
// 	{
// 		onSuccess: () => {
// 			refetch()
// 		},
// 	},
// )

// // Mutation for deleting an update
// const deleteUpdateMutation = useSupabaseMutation(
// 	(supabase, id) => supabase.from('project_updates').delete().eq('id', id),
// 	{
// 		onSuccess: () => {
// 			refetch()
// 		},
// 	},
// )
