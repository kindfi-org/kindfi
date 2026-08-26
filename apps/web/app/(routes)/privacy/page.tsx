import { notFound } from 'next/navigation'
import { LegalDocumentPage } from '~/components/sections/legal/legal-document-page'
import { getLegalDocMetadata, readLegalDoc } from '~/lib/legal-docs'

export const dynamic = 'force-static'

export const metadata = getLegalDocMetadata('privacy')

export default function PrivacyPage() {
	if (!readLegalDoc('privacy')) {
		return notFound()
	}

	return <LegalDocumentPage docId="privacy" />
}
