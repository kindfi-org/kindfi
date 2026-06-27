import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { ImageResponse } from 'next/og'
import { getBasicProjectInfoBySlug } from '~/lib/queries/projects/get-basic-project-info-by-slug'
import { getProjectShareDescription } from '~/lib/seo/project-metadata'

export const runtime = 'edge'
export const alt = 'KindFi project crowdfunding campaign'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	const client = await createSupabaseServerClient()
	const project = await getBasicProjectInfoBySlug(client, slug)

	const title = project?.title ?? 'KindFi Project'
	const description = project
		? getProjectShareDescription(project.title, project.description)
		: 'Transparent Web3 crowdfunding for social impact on Stellar.'
	const category = project?.category?.name ?? 'Social Impact'

	return new ImageResponse(
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: '100%',
				height: '100%',
				padding: 64,
				background: 'linear-gradient(135deg, #059669 0%, #0f172a 100%)',
				color: 'white',
				fontFamily: 'Inter, Arial, sans-serif',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 16,
					fontSize: 28,
					fontWeight: 700,
					opacity: 0.95,
				}}
			>
				<div
					style={{
						width: 48,
						height: 48,
						borderRadius: 12,
						background: 'rgba(255,255,255,0.15)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 24,
					}}
				>
					K
				</div>
				<span>KindFi</span>
			</div>

			<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
				<div
					style={{
						fontSize: 24,
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: '0.08em',
						opacity: 0.85,
					}}
				>
					{category}
				</div>
				<div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
					{title}
				</div>
				<div style={{ fontSize: 28, lineHeight: 1.4, opacity: 0.9, maxWidth: 960 }}>
					{description.length > 140 ? `${description.slice(0, 137)}...` : description}
				</div>
			</div>

			<div style={{ fontSize: 24, opacity: 0.8 }}>kindfi.org/projects/{slug}</div>
		</div>,
		{
			...size,
		},
	)
}
