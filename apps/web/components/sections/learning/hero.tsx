import { ArrowRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { HeroBadge } from './hero-badge'

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-background py-32">
			<div className="container relative z-10">
				<div className="mx-auto max-w-[1000px] text-center">
					{/* Badge */}
					<div className="mb-8">
						<HeroBadge text="KindFi Academy" />
					</div>

					{/* Main Heading */}
					<h1 className="mb-6 text-[64px] font-bold leading-[1.1]">
						Empowering You to Create Impact Through{' '}
						<span className="block">Knowledge</span>
					</h1>

					{/* Subtitle */}
					<p className="mx-auto mb-12 max-w-2xl text-xl text-gray-500">
						Learn how crowdfunding, blockchain, and Web3 are shaping the future
						of social aid.
					</p>

					{/* Action Buttons */}
					<div className="flex items-center justify-center gap-4">
						<Link
							href="/learn"
							className="inline-flex h-12 items-center justify-center rounded-lg bg-black px-8 text-white transition-colors hover:bg-black/90"
							legacyBehavior
						>
							Start Learning
							<ArrowRight className="ml-2 h-5 w-5" />
						</Link>

						<Link
							href="/courses"
							className="inline-flex h-12 items-center justify-center rounded-lg border-2 border-gray-200 px-8 transition-colors hover:bg-gray-50"
							legacyBehavior
						>
							<GraduationCap className="mr-2 h-5 w-5" />
							Browse Courses
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
