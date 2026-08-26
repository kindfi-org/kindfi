'use client'

import Link from 'next/link'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { LogoOrg } from '~/components/base/logo-org'
import { useFormValidation } from '~/hooks/use-form-validation'
import { useI18n } from '~/lib/i18n'
import { GithubIcon, LinkedinIcon, TwitterIcon } from '~/lib/icons/social-icons'
import { cn } from '~/lib/utils'

type FooterLinkItem = {
	label: string
	href: string
	external?: boolean
}

const FooterLinkColumn = ({ title, links }: { title: string; links: FooterLinkItem[] }) => (
	<div>
		<h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800/80">
			{title}
		</h3>
		<ul className="space-y-2.5">
			{links.map((link) => (
				<li key={link.href + link.label}>
					{link.external ? (
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-slate-600 transition-colors hover:text-emerald-800"
						>
							{link.label}
						</a>
					) : (
						<Link
							href={link.href}
							className="text-sm text-slate-600 transition-colors hover:text-emerald-800"
						>
							{link.label}
						</Link>
					)}
				</li>
			))}
		</ul>
	</div>
)

const Footer = () => {
	const { t } = useI18n()
	const { isEmailInvalid, handleValidation, resetValidation } = useFormValidation({
		email: true,
	})

	const platformLinks: FooterLinkItem[] = [
		{ label: t('nav.projects'), href: '/projects' },
		{ label: t('nav.foundations'), href: '/foundations' },
		{ label: t('nav.governance'), href: '/governance' },
		{ label: t('nav.about'), href: '/about' },
		{ label: t('nav.news'), href: '/news' },
	]

	const getInvolvedLinks: FooterLinkItem[] = [
		{ label: t('footer.startCampaign'), href: '/create-project' },
		{ label: t('footer.createFoundation'), href: '/create-foundation' },
	]

	const resourceLinks: FooterLinkItem[] = [
		{
			label: t('footer.trustlessWork'),
			href: 'https://www.trustlesswork.com/',
			external: true,
		},
		{
			label: t('footer.documentation'),
			href: 'https://kindfi.gitbook.io/kindfi',
			external: true,
		},
		{ label: t('footer.tutorials'), href: '/tutorials' },
		{ label: t('footer.faqs'), href: '/faqs' },
	]

	const legalLinks: FooterLinkItem[] = [
		{ label: t('footer.termsOfUse'), href: '/terms' },
		{ label: t('footer.privacyPolicy'), href: '/privacy' },
		{ label: t('footer.cookiePolicy'), href: '/cookies' },
		{ label: t('footer.licenses'), href: '/licenses' },
	]

	const socialLinks = [
		{
			icon: TwitterIcon,
			href: 'https://x.com/KindFi_W3',
			label: 'X (Twitter)',
		},
		{
			icon: LinkedinIcon,
			href: 'https://linkedin.com/company/kindfi',
			label: 'LinkedIn',
		},
		{
			icon: GithubIcon,
			href: 'https://github.com/kindfi-org',
			label: 'GitHub',
		},
	] as const

	return (
		<footer className="relative border-t border-slate-200/80 bg-[#fafbfc]">
			<div
				className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
				aria-hidden
			/>
			<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
					<div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-4">
						<Link
							href="/"
							className="inline-flex w-fit rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<LogoOrg width={120} height={33} className="h-8 w-auto" />
						</Link>
						<p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-700/80">
							{t('footer.brandEyebrow')}
						</p>
						<p className="max-w-sm text-sm leading-relaxed text-slate-600">
							{t('footer.description')}
						</p>
						<div>
							<h3 id="newsletter-label" className="mb-2 text-sm font-semibold text-slate-900">
								{t('footer.keepInTouch')}
							</h3>
							<form onSubmit={resetValidation}>
								<div className="flex max-w-sm flex-col gap-2 sm:flex-row">
									<Input
										type="email"
										name="email"
										placeholder={t('footer.emailPlaceholder')}
										className="border-slate-200/80 bg-white"
										aria-labelledby="newsletter-label"
										aria-describedby={`${isEmailInvalid ? 'newsletter-error' : 'newsletter-description'}`}
										required
										aria-invalid={isEmailInvalid}
										onChange={handleValidation}
									/>
									<Button
										type="submit"
										size="sm"
										className="gradient-btn shrink-0 rounded-full text-white"
									>
										{t('footer.subscribe')}
									</Button>
								</div>
								<span id="newsletter-description" className="sr-only">
									{t('footer.enterEmail')}
								</span>
								<span id="newsletter-error" className="sr-only">
									{t('footer.invalidEmail')}
								</span>
							</form>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:col-span-2 lg:col-span-8 lg:grid-cols-4">
						<FooterLinkColumn title={t('footer.platform')} links={platformLinks} />
						<FooterLinkColumn title={t('footer.getInvolved')} links={getInvolvedLinks} />
						<FooterLinkColumn title={t('footer.resources')} links={resourceLinks} />
						<FooterLinkColumn title={t('footer.legal')} links={legalLinks} />
					</div>
				</div>

				<div className="mt-12 border-t border-slate-200/80 pt-8">
					<div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
						<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
							<p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
								{t('footer.followUs')}
							</p>
							<div className="flex items-center gap-3">
								{socialLinks.map((link) => {
									const Icon = link.icon
									return (
										<a
											key={link.href}
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className={cn(
												'inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600',
												'transition-colors hover:border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-800',
											)}
											aria-label={link.label}
										>
											<Icon className="h-4 w-4" aria-hidden />
										</a>
									)
								})}
							</div>
						</div>

						<p className="text-center text-sm text-slate-600 lg:text-left">
							© {new Date().getFullYear()} KindFi. {t('footer.allRightsReserved')}.
						</p>

						<div className="flex flex-wrap items-center justify-center gap-2">
							<Button
								variant="outline"
								size="sm"
								className="rounded-full border-slate-200/80"
								asChild
							>
								<a
									href="https://kindfi.gitbook.io/kindfi"
									target="_blank"
									rel="noopener noreferrer"
								>
									{t('footer.documentation')}
								</a>
							</Button>
							<Button
								variant="outline"
								size="sm"
								className="rounded-full border-slate-200/80"
								asChild
							>
								<a href="mailto:contact@kindfi.org">{t('footer.contact')}</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export { Footer }
