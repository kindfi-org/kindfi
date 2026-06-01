import {
	Facebook,
	Globe,
	Instagram,
	LinkedinIcon,
	type LucideIcon,
	Twitter,
	Youtube,
} from 'lucide-react'

export function getSocialIcon(platform: string): LucideIcon {
	const normalized = platform.toLowerCase()
	if (normalized.includes('twitter') || normalized.includes('x.com')) {
		return Twitter
	}
	if (normalized.includes('linkedin')) {
		return LinkedinIcon
	}
	if (normalized.includes('facebook')) {
		return Facebook
	}
	if (normalized.includes('instagram')) {
		return Instagram
	}
	if (normalized.includes('youtube')) {
		return Youtube
	}
	return Globe
}
