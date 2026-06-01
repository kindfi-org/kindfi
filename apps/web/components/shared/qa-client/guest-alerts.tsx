'use client'

import { LogIn, User as UserIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/base/alert'
import { Button } from '~/components/base/button'

interface GuestAlertsProps {
	guestRemainingComments: number
	onGoToLogin: () => void
}

export const GuestAlerts = ({ guestRemainingComments, onGoToLogin }: GuestAlertsProps) => {
	if (guestRemainingComments > 0) {
		return (
			<Alert variant="default" className="mb-6 text-blue-700 bg-blue-50 border-blue-200">
				<AlertTitle className="flex gap-2 items-center">
					<UserIcon className="w-4 h-4" />
					Guest Mode
				</AlertTitle>
				<AlertDescription>
					You&apos;re currently browsing as a guest. You have {guestRemainingComments} comment
					{guestRemainingComments !== 1 ? 's' : ''} remaining.
					<Button
						variant="link"
						onClick={onGoToLogin}
						className="p-0 ml-1 h-auto font-medium text-blue-700 underline"
					>
						Log in
					</Button>{' '}
					to participate without limits.
				</AlertDescription>
			</Alert>
		)
	}

	return (
		<Alert variant="default" className="mb-6 text-yellow-700 bg-yellow-50 border-yellow-200">
			<AlertTitle className="flex gap-2 items-center">
				<LogIn className="w-4 h-4" />
				Comment Limit Reached
			</AlertTitle>
			<AlertDescription>
				You&apos;ve reached the guest comment limit.
				<Button
					variant="link"
					onClick={onGoToLogin}
					className="p-0 ml-1 h-auto font-medium text-yellow-700 underline"
				>
					Log in
				</Button>{' '}
				to continue participating or reset your guest session.
			</AlertDescription>
		</Alert>
	)
}
