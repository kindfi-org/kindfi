'use client'

import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '~/components/base/button'
import { useNotificationPermission } from '~/hooks/use-notification-permission'
import { useI18n } from '~/lib/i18n'
import type { NotificationPermissionStatus } from '~/lib/notifications/browser-permission'
import { ProfileSurfaceCard } from '../profile-surface-card'

const STATUS_MESSAGE_KEYS: Record<NotificationPermissionStatus, string> = {
	default: 'profile.browserNotificationsStatusDefault',
	granted: 'profile.browserNotificationsStatusGranted',
	denied: 'profile.browserNotificationsStatusDenied',
	unsupported: 'profile.browserNotificationsStatusUnsupported',
}

/**
 * Explicit opt-in for browser notifications. The permission prompt is only
 * shown from the button below, never on page load.
 */
export function NotificationPermissionCard() {
	const { t } = useI18n()
	const { status, isRequesting, requestPermission } = useNotificationPermission()

	async function handleEnable() {
		const result = await requestPermission()

		if (result.error) {
			toast.error(t('profile.browserNotificationsRequestFailed'))
			return
		}

		switch (result.status) {
			case 'granted':
				toast.success(t('profile.browserNotificationsEnabled'))
				break
			case 'denied':
				toast.error(t('profile.browserNotificationsBlocked'))
				break
			case 'default':
				toast(t('profile.browserNotificationsDismissed'))
				break
			case 'unsupported':
				toast.error(t('profile.browserNotificationsStatusUnsupported'))
				break
		}
	}

	return (
		<ProfileSurfaceCard className="h-full">
			<div className="mb-6 border-b border-slate-100 pb-5">
				<h3 className="text-lg font-semibold text-gray-900">
					{t('profile.browserNotificationsTitle')}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					{t('profile.browserNotificationsDescription')}
				</p>
			</div>
			<div className="space-y-4">
				<p role="status" aria-live="polite" className="text-sm text-gray-700">
					{status
						? t(STATUS_MESSAGE_KEYS[status])
						: t('profile.browserNotificationsStatusChecking')}
				</p>
				{/* The browser only prompts from `default`, so the action is hidden once decided. */}
				{status === null || status === 'default' ? (
					<Button
						type="button"
						className="rounded-xl"
						onClick={handleEnable}
						disabled={status === null || isRequesting}
					>
						<Bell className="h-4 w-4" aria-hidden="true" />
						{isRequesting
							? t('profile.browserNotificationsRequesting')
							: t('profile.browserNotificationsEnable')}
					</Button>
				) : null}
			</div>
		</ProfileSurfaceCard>
	)
}
