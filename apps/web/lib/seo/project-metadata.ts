import type { Metadata } from 'next'
import { SITE_URL } from './structured-data'

const META_DESCRIPTION_MAX_LENGTH = 160

export interface ProjectMetadataInput {
	slug: string
	title: string
	description: string | null
	image?: string | null
	categoryName?: string | null
	tagNames?: string[]
}

export function truncateMetaDescription(
	text: string,
	maxLength = META_DESCRIPTION_MAX_LENGTH,
): string {
	const normalized = text.replace(/\s+/g, ' ').trim()
	if (normalized.length <= maxLength) return normalized
	return `${normalized.slice(0, maxLength - 3).trimEnd()}...`
}

export function getProjectPageUrl(slug: string | null | undefined): string {
	if (!slug) return SITE_URL
	return `${SITE_URL}/projects/${slug}`
}

export function getProjectShareDescription(title: string, description: string | null): string {
	if (description) {
		return truncateMetaDescription(description)
	}

	return `Support ${title} on KindFi — transparent Web3 crowdfunding for social impact on the Stellar blockchain.`
}

export function getProjectOgImageUrl(slug: string, image?: string | null): string {
	if (image) return image
	return `${SITE_URL}/projects/${slug}/opengraph-image`
}

export function buildProjectMetadata(project: ProjectMetadataInput): Metadata {
	const pageUrl = getProjectPageUrl(project.slug)
	const description = getProjectShareDescription(project.title, project.description)
	const ogImageUrl = getProjectOgImageUrl(project.slug, project.image)

	const keywords = [
		'KindFi',
		'crowdfunding',
		'social impact',
		'Web3 donations',
		'Stellar blockchain',
		...(project.categoryName ? [project.categoryName] : []),
		...(project.tagNames ?? []),
	]

	return {
		title: `${project.title} | KindFi`,
		description,
		keywords,
		openGraph: {
			title: project.title,
			description,
			type: 'website',
			url: pageUrl,
			siteName: 'KindFi',
			locale: 'en_US',
			images: [
				{
					url: ogImageUrl,
					width: 1200,
					height: 630,
					alt: `${project.title} — KindFi crowdfunding campaign`,
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: project.title,
			description,
			images: [ogImageUrl],
		},
		alternates: {
			canonical: pageUrl,
		},
	}
}
