import { SITE_URL } from './structured-data'

export function getNewsArticleUrl(slug: string): string {
	return `${SITE_URL}/news/${slug}`
}
