import { Globe, type LucideIcon } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import type { SimpleIcon } from 'simple-icons'
import { siApple, siFacebook, siGithub, siInstagram, siX, siYoutube } from 'simple-icons'

import { SimpleIconSvg } from './simple-icon'

export type SocialIconComponent = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>

const createBrandIcon = (icon: SimpleIcon, label: string): SocialIconComponent => {
	const BrandIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
		<SimpleIconSvg icon={icon} className={className} title={label} {...props} />
	)

	BrandIcon.displayName = `${label}Icon`

	return BrandIcon
}

const createCustomBrandIcon = (path: string, label: string): SocialIconComponent => {
	const BrandIcon = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
		<svg
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden={label ? undefined : true}
			{...props}
		>
			<title>{label}</title>
			<path d={path} fill="currentColor" />
		</svg>
	)

	BrandIcon.displayName = `${label}Icon`

	return BrandIcon
}

export const AppleIcon = createBrandIcon(siApple, 'Apple')
export const FacebookIcon = createBrandIcon(siFacebook, 'Facebook')
export const GithubIcon = createBrandIcon(siGithub, 'GitHub')
export const InstagramIcon = createBrandIcon(siInstagram, 'Instagram')
export const LinkedinIcon = createCustomBrandIcon(
	'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
	'LinkedIn',
)
export const XIcon = createBrandIcon(siX, 'X')
export const YoutubeIcon = createBrandIcon(siYoutube, 'YouTube')

/** @deprecated Use XIcon — kept for call sites that still reference Twitter naming. */
export const TwitterIcon = XIcon

export function getSocialIcon(platform: string): SocialIconComponent {
	const normalized = platform.toLowerCase()

	if (normalized.includes('twitter') || normalized.includes('x.com')) {
		return XIcon
	}
	if (normalized.includes('linkedin')) {
		return LinkedinIcon
	}
	if (normalized.includes('facebook')) {
		return FacebookIcon
	}
	if (normalized.includes('instagram')) {
		return InstagramIcon
	}
	if (normalized.includes('youtube')) {
		return YoutubeIcon
	}
	if (normalized.includes('github')) {
		return GithubIcon
	}
	if (normalized.includes('apple')) {
		return AppleIcon
	}

	return Globe
}
