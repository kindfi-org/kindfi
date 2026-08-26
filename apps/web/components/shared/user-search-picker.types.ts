import type { SearchableUser } from '~/lib/schemas/user.schemas'

export interface UserSearchPickerProps {
	selectedUser: SearchableUser | null
	onSelect: (user: SearchableUser | null) => void
	disabled?: boolean
	excludeUserIds?: string[]
}
