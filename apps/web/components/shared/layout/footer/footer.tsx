// components/layout/footer.tsx
'use client'

import { GithubIcon, LinkedinIcon, TwitterIcon } from 'lucide-react'
// https://github.com/simple-icons/simple-icons?tab=readme-ov-file#node-usage-
// import { siGithub as GithubIcon, siLinkerd as LinkedinIcon, siX as Twitter } from 'simple-icons';
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { useFormValidation } from '~/hooks/use-form-validation'
import { useI18n } from '~/lib/i18n'

const Footer = () => {
	const { t } = useI18n()
	const { isEmailInvalid, handleValidation, resetValidation } =
		useFormValidation({
			email: true,
		})
	const mainLinks = [
		{
			title: t('footer.projects'),
			links: [
				{ label: t('footer.socialProjects'), href: '/projects' },
				{ label: t('footer.startCampaign'), href: '/create' },
				{ label: t('footer.featuredProjects'), href: '/featured' },
				{ label: t('footer.recentInvestments'), href: '/investments' },
			],
		},
		{
			title: t('footer.resources'),
			links: [
				{
					label: t('footer.trustlessWork'),
					href: 'https://www.trustlesswork.com/',
					target: '_blank',
				},
				{
					label: t('footer.documentation'),
					href: 'https://kindfi.gitbook.io/kindfi',
					target: '_blank',
				},
				{ label: t('footer.news'), href: '/news' },
				{ label: t('footer.tutorials'), href: '/tutorials' },
				{ label: t('footer.faqs'), href: '/faqs' },
			],
		},
		{
			title: t('footer.legal'),
			links: [
				{ label: t('footer.termsOfUse'), href: '/terms' },
				{ label: t('footer.privacyPolicy'), href: '/privacy' },
				{ label: t('footer.cookiePolicy'), href: '/cookies' },
				{ label: t('footer.licenses'), href: '/licenses' },
			],
		},
	]

	const socialLinks = [
		{
			icon: <TwitterIcon className="h-5 w-5" />,
			href: 'https://x.com/KindFi_W3',
			label: 'Twitter',
		},
		{
			icon: <LinkedinIcon className="h-5 w-5" />,
			href: 'https://linkedin.com/company/kindfi',
			label: 'LinkedIn',
		},
		{
			icon: <GithubIcon className="h-5 w-5" />,
			href: 'https://github.com/kindfi-org',
			label: 'Facebook',
		},
	]

	return (
		<footer className="border-t bg-gray-50">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{/* Brand Column */}
					<div className="flex flex-col gap-4">
						<Link href="/" className="flex items-center space-x-2">
							<span className="text-xl font-bold text-black">KindFi</span>
						</Link>
						<p className="text-sm text-gray-600">{t('footer.description')}</p>
						{/* Newsletter Subscription */}
						<div className="mt-4">
							<h3 id="newsletter-label" className="mb-2 text-sm font-semibold">
								{t('footer.keepInTouch')}
							</h3>
							<form onSubmit={resetValidation}>
								<div className="flex gap-2">
									<Input
										type="email"
										name="email"
										placeholder={t('footer.emailPlaceholder')}
										className="max-w-[200px]"
										aria-labelledby="newsletter-label"
										aria-describedby={`${isEmailInvalid ? 'newsletter-error' : 'newsletter-description'}`}
										required
										aria-invalid={isEmailInvalid}
										onChange={handleValidation}
									/>
									<Button
										size="sm"
										className="bg-blue-600 hover:bg-blue-900 text-white"
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

					{/* Links Columns */}
					{mainLinks.map((column) => (
						<div key={column.title}>
							<h3 className="mb-3 text-sm font-semibold text-black">
								{column.title}
							</h3>
							<ul className="space-y-2">
								{column.links.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 border-t pt-8">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
						<div className="flex items-center gap-4">
							{socialLinks.map((link) => (
								<a
									key={link.href}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-gray-600 hover:text-blue-700 transition-colors"
									aria-label={link.label}
								>
									{link.icon}
								</a>
							))}
						</div>
						<p className="text-sm text-gray-600">
							© {new Date().getFullYear()} KindFi.{' '}
							{t('footer.allRightsReserved')}.
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								{t('footer.documentation')}
							</Button>
							<Button variant="outline" size="sm">
								{t('footer.contact')}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export { Footer }
