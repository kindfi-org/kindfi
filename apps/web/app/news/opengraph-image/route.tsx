import { ImageResponse } from 'next/og'
import { readRawPostBySlug } from '~/lib/mdx'

export const runtime = 'nodejs'

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url)
	const slug = searchParams.get('slug')
	if (!slug) {
		return new Response('Missing slug', { status: 400 })
	}
	const raw = readRawPostBySlug(slug)
	if (!raw) {
		return new Response('Not found', { status: 404 })
	}
	const { title, description } = raw.frontmatter

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				width: '100%',
				height: '100%',
				padding: 64,
				background: 'linear-gradient(135deg, #0ea5e9, #111827)',
				color: 'white',
				fontFamily: 'Inter, Arial',
			}}
		>
			<div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>
				{title}
			</div>
			<div style={{ marginTop: 24, fontSize: 28, opacity: 0.9 }}>
				{description}
			</div>
			<div style={{ marginTop: 'auto', fontSize: 24, opacity: 0.8 }}>
				kindfi.org/news/{slug}
			</div>
		</div>,
		{
			width: 1200,
			height: 630,
		},
	)
}
