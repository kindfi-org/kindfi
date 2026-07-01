'use client'

import { MonitorSmartphone } from 'lucide-react'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { PasskeyDeviceCompatibility } from '~/components/shared/passkey-device-compatibility'
import { useI18n } from '~/lib/i18n'

export function PasskeyCompatDialog() {
	const { t } = useI18n()

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="lg" variant="outline" className="gradient-border-btn w-full">
					<MonitorSmartphone className="mr-2 h-4 w-4" aria-hidden="true" />
					{t('auth.passkeyCompatTrigger')}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>{t('auth.passkeyCompatTitle')}</DialogTitle>
					<DialogDescription>{t('auth.passkeyCompatSubtitle')}</DialogDescription>
				</DialogHeader>
				<PasskeyDeviceCompatibility
					variant="inline"
					hideHeader
					className="border-0 bg-transparent px-0 py-0"
				/>
			</DialogContent>
		</Dialog>
	)
}
