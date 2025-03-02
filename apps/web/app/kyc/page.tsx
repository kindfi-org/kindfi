'use client'

import { useState } from 'react'
import { Button } from '~/components/base/button'
import KYCModal from '~/components/shared/kyc/kyc-modal'

export default function KYCVerificationPage() {
	const [isKYCModalOpen, setIsKYCModalOpen] = useState(false)

	return (
		<div className="container mx-auto py-10">
			<h1 className="text-3xl font-bold mb-6">KYC Verification</h1>
			<p className="mb-4">
				To access all features, you need to complete the KYC verification
				process.
			</p>

			<Button
				onClick={() => setIsKYCModalOpen(true)}
				className="bg-black text-white hover:bg-black/80"
			>
				Start KYC Verification
			</Button>

			<KYCModal
				isOpen={isKYCModalOpen}
				onClose={() => setIsKYCModalOpen(false)}
			/>
		</div>
	)
}
