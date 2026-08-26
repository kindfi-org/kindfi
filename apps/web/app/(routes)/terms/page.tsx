import { notFound } from 'next/navigation'
import { LegalDocumentPage } from '~/components/sections/legal/legal-document-page'
import { getLegalDocMetadata, readLegalDoc } from '~/lib/legal-docs'

export const dynamic = 'force-static'

export const metadata = getLegalDocMetadata('terms')

export default function TermsPage() {
	if (!readLegalDoc('terms')) {
		return notFound()
	}

	return <LegalDocumentPage docId="terms" />
}
