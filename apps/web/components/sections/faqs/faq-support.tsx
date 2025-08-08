import { ArrowRight, Lightbulb, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'

export function FaqSupport() {
	return (
		<section className="w-full px-7 pt-24 bg-white flex flex-col gap-7 justify-center items-center">
			<h2 className="gradient-text font-semibold text-3xl md:text-4xl">
				Still Have Questions?
			</h2>
			<p className="text-[#727276] text-center line-clamp-2 text-sm md:text-base">
				Can't find what you're looking for? Join our community for real-time
				support and discussions
			</p>
			<div className="flex flex-col gap-4 justify-center items-center md:flex-row">
				<Link href="/" legacyBehavior>
					<Button className="bg-black text-white">
						<ArrowRight />
						See How It Works
					</Button>
				</Link>
				<Link href="/community" legacyBehavior>
					<Button className="border border-[#E6E6E6] text-black">
						<MessageCircle />
						See The Community
					</Button>
				</Link>
				<Link href="/create-project" legacyBehavior>
					<Button className="border border-[#E6E6E6] text-white bg-[#466E23]">
						<Lightbulb />
						Start a Campaign
					</Button>
				</Link>
			</div>
		</section>
	)
}
