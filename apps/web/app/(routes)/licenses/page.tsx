import { notFound } from 'next/navigation'
import { LegalDocumentPage } from '~/components/sections/legal/legal-document-page'
import { getLegalDocMetadata, readLegalDoc } from '~/lib/legal-docs'

export const dynamic = 'force-static'

export const metadata = getLegalDocMetadata('licenses')

export default function LicensesPage() {
	if (!readLegalDoc('licenses')) {
		return notFound()
	}

	return <LegalDocumentPage docId="licenses" />
}
