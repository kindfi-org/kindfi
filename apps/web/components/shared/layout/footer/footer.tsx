// components/layout/footer.tsx
'use client'

import { GithubIcon, LinkedinIcon, TwitterIcon } from 'lucide-react'
// https://github.com/simple-icons/simple-icons?tab=readme-ov-file#node-usage-
// import { siGithub as GithubIcon, siLinkerd as LinkedinIcon, siX as Twitter } from 'simple-icons';
import Link from 'next/link'
import { Button } from '~/components/base/button'
import { Input } from '~/components/base/input'
import { useFormValidation } from '~/hooks/use-form-validation'

const Footer = () => {
	const { isEmailInvalid, handleValidation } = useFormValidation({
		email: true,
	})
	const mainLinks = [
		{
			title: 'Projects',
			links: [
				{ label: 'Social Projects', href: '/projects' },
				{ label: 'Start a Campaign', href: '/create' },
				{ label: 'Featured Projects', href: '/featured' },
				{ label: 'Recent Investments', href: '/investments' },
			],
		},
		{
			title: 'Resources',
			links: [
				{
					label: 'Trustless Work',
					href: 'https://www.trustlesswork.com/',
					target: '_blank',
				},
				{
					label: 'Documentation',
					href: 'https://kindfi.gitbook.io/kindfi',
					target: '_blank',
				},
				{ label: 'Tutorials', href: '/tutorials' },
				{ label: 'FAQs', href: '/faqs' },
			],
		},
		{
			title: 'Legal',
			links: [
				{ label: 'Terms of Use', href: '/terms' },
				{ label: 'Privacy Policy', href: '/privacy' },
				{ label: 'Cookie Policy', href: '/cookies' },
				{ label: 'Licenses', href: '/licenses' },
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
						<p className="text-sm text-gray-600">
							The first Web3 platform connecting supporters to impactful causes
							while driving blockchain adoption for social and environmental
							change.
						</p>
						{/* Newsletter Subscription */}
						<div className="mt-4">
							<h3 id="newsletter-label" className="mb-2 text-sm font-semibold">
								Keep in touch
							</h3>
							<div className="flex gap-2">
								<Input
									type="email"
									name="email"
									placeholder="tu@email.com"
									className="max-w-[200px]"
									aria-labelledby="newsletter-label"
									aria-describedby={`${
										isEmailInvalid
											? 'newsletter-error'
											: 'newsletter-description'
									}`}
									required
									aria-invalid={isEmailInvalid}
									onChange={handleValidation}
								/>
								<Button
									size="sm"
									className="bg-blue-600 hover:bg-blue-900 text-white"
								>
									Keep in touch
								</Button>
							</div>
							<span id="newsletter-description" className="sr-only">
								Enter your email address to receive our updates and newsletters
							</span>
							<span id="newsletter-error" className="sr-only">
								Please enter a valid email address
							</span>
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
							© {new Date().getFullYear()} KindFi. All rights reserved.
						</p>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm">
								Documentation
							</Button>
							<Button variant="outline" size="sm">
								Contact
							</Button>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
