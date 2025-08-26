import { readAllPosts } from '~/lib/mdx'

function escapeXml(unsafe: string): string {
	return unsafe
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;')
}

export async function GET() {
	const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
	const posts = readAllPosts().sort((a, b) => (a.date < b.date ? 1 : -1))
	const items = posts
		.map(
			(p) => `
			<item>
				<title>${escapeXml(p.title)}</title>
				<link>${base}/news/${p.slug}</link>
				<guid>${base}/news/${p.slug}</guid>
				<pubDate>${new Date(p.date).toUTCString()}</pubDate>
				<description>${escapeXml(p.description)}</description>
			</item>
		`,
		)
		.join('\n')

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
	<rss version="2.0">
		<channel>
			<title>KindFi News</title>
			<link>${base}/news</link>
			<description>Updates and news from KindFi</description>
			${items}
		</channel>
	</rss>`

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
		},
	})
}
