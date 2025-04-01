import { FileText } from 'lucide-react'
import Link from 'next/link'

import type { CompanyResources } from '~/lib/types/project/overview-section.types'

interface InvestmentTermsProps {
	data: CompanyResources
}

export function InvestmentTerms({ data }: InvestmentTermsProps) {
	return (
		<div className="space-y-6 mt-10">
			<h2 className="text-3xl font-bold">Investment Terms</h2>

			<p className="text-gray-700 leading-relaxed mb-6">
				You will be investing in {data.companyName} through an SPV. This means
				that when you invest, you will be signing the SPV Subscription
				Agreement, not the direct investment contract. For more information on
				SPVs, see{' '}
				<Link
					href={data.infoLink}
					className="text-blue-600 hover:underline"
					target="_blank"
					rel="noopener noreferrer"
				>
					here
				</Link>
				.
			</p>

			<div className="space-y-2">
				{data.documents.map((doc) => (
					<Link
						key={doc.id}
						href={doc.href}
						className="flex items-center gap-3 text-black"
						target="_blank"
						rel="noopener noreferrer"
						download={doc.title}
					>
						<FileText className="h-5 w-5 text-gray-500" />
						<span>{doc.title}</span>
					</Link>
				))}
			</div>
		</div>
	)
}
