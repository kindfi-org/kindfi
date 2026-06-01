import { useEffect, useState } from 'react'
import {
	getGuestRemainingComments as utilGetGuestRemainingComments,
	getGuestUserId as utilGetGuestUserId,
	incrementGuestCommentCount as utilIncrementGuestCommentCount,
	resetGuestCommentCount as utilResetGuestCommentCount,
} from '~/lib/utils/qa'
import type { UserData } from '~/lib/types/project/project-qa.types'

export const useGuestUser = (currentUser?: UserData | null) => {
	const [guestUserId, setGuestUserId] = useState<string | null>(null)
	const [guestRemainingComments, setGuestRemainingComments] = useState(3)
	const [_isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

	useEffect(() => {
		if (!currentUser) {
			const userId = utilGetGuestUserId()
			setGuestUserId(userId)
			setGuestRemainingComments(utilGetGuestRemainingComments())
		}
	}, [currentUser])

	const effectiveUser: UserData =
		currentUser ||
		(guestUserId
			? {
					id: guestUserId,
					full_name: 'Guest User',
					is_team_member: false,
				}
			: null)

	const checkGuestCommentLimit = () => {
		if (currentUser) return true

		const remaining = utilGetGuestRemainingComments()
		if (remaining <= 0) {
			setIsLoginDialogOpen(true)
			return false
		}
		return true
	}

	const handleGuestCommentSuccess = () => {
		if (!currentUser) {
			const newCount = utilIncrementGuestCommentCount()
			setGuestRemainingComments(Math.max(0, 3 - newCount))
		}
	}

	const handleContinueAsGuest = () => {
		setIsLoginDialogOpen(false)
		utilResetGuestCommentCount()
		setGuestRemainingComments(3)
	}

	return {
		effectiveUser,
		guestRemainingComments,
		checkGuestCommentLimit,
		handleGuestCommentSuccess,
		handleContinueAsGuest,
	}
}
