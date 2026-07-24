import { redirect } from 'next/navigation'

export default async function ProjectPitchPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params
	redirect(`/projects/${slug}/manage/content?step=story-primary`)
}
