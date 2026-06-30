'use client'

import { motion } from 'framer-motion'
import { DonationStream } from '~/components/sections/projects/detail/tabs/donation-stream'

interface DonationsTabProps {
	projectSlug: string
}

export function DonationsTab({ projectSlug }: DonationsTabProps) {
	return (
		<motion.div
			className="rounded-xl bg-white p-6 shadow-sm"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
		>
			<DonationStream projectSlug={projectSlug} variant="tab" />
		</motion.div>
	)
}
