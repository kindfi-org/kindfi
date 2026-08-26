'use client'

import { BadgeAlert, Fingerprint, Lock, Shield } from 'lucide-react'
import { Button } from '~/components/base/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/base/dialog'
import { useI18n } from '~/lib/i18n'

export function PasskeyInfoDialog() {
	const { t } = useI18n()

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="lg" variant="outline" className="gradient-border-btn w-full">
					<BadgeAlert className="mr-2 h-4 w-4" aria-hidden="true" />
					{t('auth.passkeyWhatIsTrigger')}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{t('auth.passkeyWhatIs')}</DialogTitle>
					<DialogDescription>{t('auth.passkeyWhatIsBody')}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<section className="flex items-start gap-3">
						<div className="flex shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-primary/10 p-2.5">
							<Shield className="h-5 w-5 text-primary" aria-hidden="true" />
						</div>
						<div>
							<h2 className="text-sm font-semibold text-slate-900">
								{t('auth.passkeyTipSecureTitle')}
							</h2>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{t('auth.passkeyTipSecureBody')}
							</p>
						</div>
					</section>
					<section className="flex items-start gap-3">
						<div className="flex shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-primary/10 p-2.5">
							<Fingerprint className="h-5 w-5 text-primary" aria-hidden="true" />
						</div>
						<div>
							<h2 className="text-sm font-semibold text-slate-900">
								{t('auth.passkeyTipEasyTitle')}
							</h2>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{t('auth.passkeyTipEasyBody')}
							</p>
						</div>
					</section>
					<section className="flex items-start gap-3">
						<div className="flex shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-primary/10 p-2.5">
							<Lock className="h-5 w-5 text-primary" aria-hidden="true" />
						</div>
						<div>
							<h2 className="text-sm font-semibold text-slate-900">
								{t('auth.passkeyTipDevicesTitle')}
							</h2>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								{t('auth.passkeyTipDevicesBody')}
							</p>
						</div>
					</section>
				</div>
			</DialogContent>
		</Dialog>
	)
}
