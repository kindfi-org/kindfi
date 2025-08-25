'use client'

import { formatDistanceToNow } from 'date-fns'
import { ChevronDown, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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
import { Avatar, AvatarImage } from '~/components/base/avatar'
import { Button } from '~/components/base/button'
import { Card, CardContent } from '~/components/base/card'
import { PLACEHOLDER_IMG } from '~/lib/constants/paths'
import { UpdateForm } from './update-form'

// Define the Update type based on actual DB structure
type Update = {
	id: string
	content: string
	created_at: string
	updated_at: string
	author_id: string
}

interface UpdateCardProps {
	data: Update[]
	updatesUrl: string
	canManageUpdates?: boolean
	onEdit?: (id: string, data: { content: string }) => void
	onDelete?: (id: string) => Promise<void>
}

export function UpdateCard({
	data,
	updatesUrl,
	canManageUpdates = false,
	onEdit,
	onDelete,
}: UpdateCardProps) {
	const [expandedOptions, setExpandedOptions] = useState<string | null>(null)
	const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null)
	const [deletingUpdateId, setDeletingUpdateId] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)

	const toggleOptions = (updateId: string) => {
		setExpandedOptions(expandedOptions === updateId ? null : updateId)
	}

	const handleEdit = (update: Update) => {
		setEditingUpdateId(update.id)
		setExpandedOptions(null)
	}

	const handleDelete = (updateId: string) => {
		setDeletingUpdateId(updateId)
		setExpandedOptions(null)
	}

	const confirmDelete = async () => {
		if (!deletingUpdateId || !onDelete) return

		try {
			setIsDeleting(true)
			await onDelete(deletingUpdateId)
		} catch (error) {
			console.error('Error deleting update:', error)
		} finally {
			setIsDeleting(false)
			setDeletingUpdateId(null)
		}
	}

	const formatDate = (dateString: string) => {
		try {
			return formatDistanceToNow(new Date(dateString), { addSuffix: true })
		} catch (_error) {
			return dateString
		}
	}

	// Function to extract the first few words as a "title"
	const extractTitle = (content: string): string => {
		const words = content.split(' ')
		const firstFewWords = words.slice(0, 5).join(' ')
		return firstFewWords + (words.length > 5 ? '...' : '')
	}

	return (
		<div className="space-y-6 mt-10">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold">Updates</h2>
				<Link href={updatesUrl}>
					<Button className="text-xl font-bold">{data.length} updates</Button>
				</Link>
			</div>
			{editingUpdateId && (
				<UpdateForm
					update={data.find((update) => update.id === editingUpdateId)}
					onSubmit={(formData) => {
						if (onEdit) {
							onEdit(editingUpdateId, formData)
							setEditingUpdateId(null)
						}
					}}
					onCancel={() => setEditingUpdateId(null)}
					isSubmitting={false}
				/>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{data.length > 0 ? (
					data.map((update) => (
						<Card key={update.id} className="overflow-hidden border-gray-200">
							<CardContent className="p-4 sm:p-6">
								<div className="flex items-center justify-between mb-4 relative">
									<div className="flex items-center gap-3 my-4">
										<Avatar>
											<AvatarImage
												src={`${PLACEHOLDER_IMG}?height=40&width=40`}
												alt="User"
											/>
										</Avatar>
										<div>
											<p className="font-medium">
												Author ID: {update.author_id?.substring(0, 8)}...
											</p>
											<p className="text-sm text-gray-500">
												{formatDate(update.created_at)}
											</p>
										</div>
									</div>
									{canManageUpdates && (
										<Button
											size="icon"
											className="text-gray-500 hover:text-gray-700"
											onClick={() => toggleOptions(update.id)}
											aria-label="Toggle additional options"
											aria-expanded={expandedOptions === update.id}
										>
											<ChevronDown className="h-5 w-5" />
										</Button>
									)}
								</div>
								{expandedOptions === update.id && (
									<div className="absolute right-6 top-16 z-10 p-3 bg-white shadow-md rounded-md border border-gray-200">
										<h4 className="font-semibold mb-2">Options</h4>
										<Button
											variant="outline"
											className="mr-2 flex items-center gap-2"
											onClick={() => handleEdit(update)}
										>
											<Edit size={16} />
											Edit
										</Button>
										<Button
											variant="outline"
											className="text-red-500 flex items-center gap-2"
											onClick={() => handleDelete(update.id)}
										>
											<Trash2 size={16} />
											Delete
										</Button>
									</div>
								)}

								<h3 className="text-xl font-bold mb-4">
									{extractTitle(update.content)}
								</h3>

								<p className="text-gray-700 leading-relaxed mb-6">
									{update.content.length > 150
										? `${update.content?.substring(0, 150)}...`
										: update.content}
								</p>
								<Link href={`${updatesUrl}/${update.id}`}>
									<Button variant="outline" className="w-full">
										Read more
									</Button>
								</Link>
							</CardContent>
						</Card>
					))
				) : (
					<div className="col-span-full text-center py-10">
						<p className="text-gray-500 text-lg">No updates available yet.</p>
					</div>
				)}
			</div>
			<AlertDialog
				open={!!deletingUpdateId}
				onOpenChange={(open) => !open && setDeletingUpdateId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							update.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							className="bg-red-500 hover:bg-red-600"
							disabled={isDeleting}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
