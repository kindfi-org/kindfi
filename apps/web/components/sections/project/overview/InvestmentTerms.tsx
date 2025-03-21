import { FileText } from 'lucide-react'
import Link from 'next/link'

interface DocumentLink {
	id: string
	title: string
	href: string
}

const documentLinks: DocumentLink[] = [
	{
		id: 'spv-agreement',
		title: 'SPV Subscription Agreement',
		href: '/documents/spv-subscription-agreement.pdf',
	},
	{
		id: 'safe-agreement',
		title: 'SAFE (Simple Agreement for Future Equity)',
		href: '/documents/safe-agreement.pdf',
	},
]

const companyName = 'Qnetic Corporation'

const infoLink = 'https://example.com/spv-information'

export function InvestmentTerms() {
	return (
		<div className="space-y-6 mt-10">
			<h2 className="text-3xl font-bold tracking-tight">Investment Terms</h2>

			<p className="text-gray-700 leading-relaxed mb-6">
				You will be investing in {companyName} through an SPV. This means that
				when you invest, you will be signing the SPV Subscription Agreement, not
				the direct investment contract. For more information on SPVs, see{' '}
				<Link
					href={infoLink}
					className="text-blue-600 hover:underline"
					target="_blank"
					rel="noopener noreferrer"
				>
					here
				</Link>
				.
			</p>

			<div className="space-y-2">
				{documentLinks.map((doc) => (
					<Link
						key={doc.id}
						href={doc.href}
						className="flex items-center gap-3 text-black"
						target="_blank"
						rel="noopener noreferrer"
					>
						<FileText className="h-5 w-5 text-gray-500" />
						<span>{doc.title}</span>
					</Link>
				))}
			</div>
		</div>
	)
}
