'use client'

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '~/components/base/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { useI18n } from '~/lib/i18n/context'

type WizardStepShellProps = {
	title: string
	description?: string
	children: ReactNode
	onBack?: () => void
	onContinue: () => void
	onSaveLater?: () => void
	isContinueDisabled?: boolean
	isSaving?: boolean
	continueLabel?: string
	showBack?: boolean
	showSaveLater?: boolean
}

export function WizardStepShell({
	title,
	description,
	children,
	onBack,
	onContinue,
	onSaveLater,
	isContinueDisabled = false,
	isSaving = false,
	continueLabel,
	showBack = true,
	showSaveLater = false,
}: WizardStepShellProps) {
	const { t } = useI18n()

	return (
		<Card className="border-border">
			<CardHeader className="space-y-1.5">
				<CardTitle className="text-xl font-semibold">{title}</CardTitle>
				{description ? <CardDescription>{description}</CardDescription> : null}
			</CardHeader>
			<CardContent className="space-y-6">
				{children}
				<div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-2">
						{showBack && onBack ? (
							<Button
								type="button"
								variant="outline"
								onClick={onBack}
								disabled={isSaving}
								className="gap-2"
							>
								<ChevronLeft className="h-4 w-4" />
								{t('projects.manage.contentWizard.back')}
							</Button>
						) : null}
						{showSaveLater && onSaveLater ? (
							<Button type="button" variant="ghost" onClick={onSaveLater} disabled={isSaving}>
								{t('projects.manage.contentWizard.saveAndFinishLater')}
							</Button>
						) : null}
					</div>
					<Button
						type="button"
						onClick={onContinue}
						disabled={isContinueDisabled || isSaving}
						className="gap-2"
					>
						{isSaving ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								{t('projects.manage.contentWizard.saving')}
							</>
						) : (
							<>
								{continueLabel ?? t('projects.manage.contentWizard.continue')}
								<ChevronRight className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
