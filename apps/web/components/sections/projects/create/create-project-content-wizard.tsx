'use client'

import { ContentWizard } from '~/components/sections/projects/content-wizard/content-wizard'
import { ContentWizardProvider } from '~/hooks/contexts/use-content-wizard.context'
import { useI18n } from '~/lib/i18n/context'

type CreateProjectContentWizardProps = {
	developmentOnly?: boolean
	lockedFoundation?: { id: string; name: string }
}

export function CreateProjectContentWizard({
	developmentOnly = false,
	lockedFoundation,
}: CreateProjectContentWizardProps) {
	const { language } = useI18n()

	return (
		<ContentWizardProvider
			mode="create"
			developmentOnly={developmentOnly}
			lockedFoundation={lockedFoundation}
			defaultSourceLocale={language}
			initialData={{
				foundationId: lockedFoundation?.id,
				sourceLocale: language,
			}}
		>
			<ContentWizard />
		</ContentWizardProvider>
	)
}
