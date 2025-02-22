import { ArrowRight, Heart } from 'lucide-react'
import Link from 'next/link'

export function JoinCommunity() {
	return (
		<section className="py-24 bg-background">
			<div className="container">
				<div className="text-center max-w-3xl mx-auto">
					<h2 className="text-4xl font-bold mb-4">
						Join Our Learning Community
					</h2>

					<p className="text-xl text-gray-600 mb-12">
						Stay updated with the latest resources, tutorials, and insights
						about Web3 crowdfunding.
					</p>

					<div className="flex items-center justify-center gap-4">
						<Link
							href="/workshop"
							className="inline-flex h-12 items-center justify-center rounded-lg bg-black px-8 text-white transition-colors hover:bg-black/90"
						>
							Join Free Workshop
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>

						<Link
							href="/subscribe"
							className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 px-8 transition-colors hover:bg-gray-50"
						>
							<Heart className="mr-2 h-5 w-5" />
							Subscribe to Updates
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
