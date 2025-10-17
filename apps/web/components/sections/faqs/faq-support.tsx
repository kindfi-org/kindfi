import { ArrowRight, Lightbulb, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { useTranslation } from '~/hooks/use-translation'

export function FaqSupport() {
	const { t } = useTranslation()
	return (
		<section className="w-full px-7 pt-24 bg-transparent flex flex-col gap-7 justify-center items-center">
			<div className="w-full max-w-4xl bg-white border border-[#E6E6E6] rounded-2xl p-6 md:p-10 shadow-sm">
				<h2 className="gradient-text font-semibold text-3xl md:text-4xl text-center">
					{t('faqs.support.title')}
				</h2>
				<p className="text-[#727276] text-center mt-2 text-sm md:text-base">
					{t('faqs.support.description')}
				</p>
				<div className="mt-6 flex flex-col gap-4 justify-center items-center md:flex-row">
				<Link href="/">
					<Button className="bg-black text-white">
						<ArrowRight />
						{t('about.seeHowItWorks')}
					</Button>
				</Link>
				<Link href="/community">
					<Button className="border border-[#E6E6E6] text-black">
						<MessageCircle />
						{t('faqs.support.seeCommunity')}
					</Button>
				</Link>
				<Link href="/create-project">
					<Button className="border border-[#E6E6E6] text-white bg-[#466E23]">
						<Lightbulb />
						{t('faqs.support.startCampaign')}
					</Button>
				</Link>
				</div>
			</div>
		</section>
	)
}
