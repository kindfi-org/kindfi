'use client'

import { Award } from 'lucide-react'
import { CTAButtons } from './cta-buttons'

export default function ModuleFooter() {
	return (
		<footer className="p-10">
			<section
				className="w-full rounded-3xl md:px-10 py-10 px-5 shadow-lg"
				style={{
					background:
						'linear-gradient(to right, #f3f7ff 0%, #f3f7ff 10%, white 25%, white 75%, #eaf7ea 90%, #eaf7ea 100%)',
				}}
			>
				<div className="grid gap-8 lg:grid-cols-[1fr_200px]">
					<div className="space-y-6">
						{/* Title */}
						<h2 className="text-4xl font-bold">
							Ready to continue your journey?
						</h2>

						{/* Description */}
						<p className="text-gray-600 text-lg font-semibold">
							Complete this module to earn the Stellar Expert badge and unlock
							the next level of learning.
						</p>

						{/* CTA Buttons */}
						<CTAButtons />
					</div>

					{/* Next Lesson Card */}
					<div className="flex items-center justify-center">
						<div className="p-[15px] bg-gradient-to-r from-blue-100 via-blue-200 to-gray-200 rounded-full">
							<div className="bg-white rounded-full w-24 h-24 flex items-center justify-center relative">
								<Award className="h-16 w-16 text-green-500" />
							</div>
						</div>
					</div>
				</div>
			</section>
		</footer>
	)
}
