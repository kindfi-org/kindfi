import { redirect } from 'next/navigation'

export default async function ProjectHighlightsPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	redirect(`/projects/${slug}/manage/content?step=highlights-primary`)
}
