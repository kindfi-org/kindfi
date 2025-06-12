import type { Tables } from '~/lib/types/database.types'

export interface UpdateItem {
	id: string
	likes: string
	comments: string
	title: string
	author: {
		name: string
		avatar: string
	}
	date: string
	description?: string
	readMoreUrl: string
	isFeatured?: boolean
}

// Infer at apps/web/components/sections/project/update/update-form.tsx is fine, but it is not align with the database schema
// so we will use the database schema instead
export type UpdateFormValues = Pick<
	Tables<'project_updates'>,
	'author_id' | 'content' | 'project_id' | 'id'
>

export interface UpdateFormProps {
	onSubmit: (data: UpdateFormValues) => void
	onCancel: () => void
	isSubmitting: boolean
	update?: UpdateFormValues
}

export interface UpdateCardProps {
	data: Tables<'project_updates'>[]
	updatesUrl: string
	canManageUpdates?: boolean
	onEdit?: (editProps: UpdateFormValues) => void
	onDelete?: (id: string) => void
}
