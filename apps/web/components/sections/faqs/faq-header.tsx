'use client'

import { Button } from '~/components/base/button'
import { useTranslation } from '~/hooks/use-translation'

export function FaqHeader() {
	const { t } = useTranslation()
	return (
		<section className="w-full flex flex-col justify-center items-center pb-32 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50">
			<Button className="border border-[#E6E6E6] text-black rounded-3xl text-xs md:text-base shadow-sm hover:shadow transition">
				{t('faqs.badge')}
			</Button>

			<div className="flex flex-col justify-center items-center my-7 gap-4 w-full">
				<h1 className="gradient-text text-4xl py-1 font-semibold text-center md:text-5xl xl:text-6xl">
					{t('faqs.title1')}
				</h1>
				<h2 className="text-black text-4xl font-semibold text-center md:text-5xl xl:text-6xl">
					{t('faqs.title2')}
				</h2>
				<p className="text-muted-foreground text-base md:text-lg text-center">
					{t('faqs.subtitle')}
				</p>
			</div>
		</section>
	)
}
