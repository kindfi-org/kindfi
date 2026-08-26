import { MilestoneReviewsPanel } from '~/components/sections/projects/manage/milestone-reviews/milestone-reviews-panel'

export default async function ProjectMilestonesManagePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	return <MilestoneReviewsPanel slug={slug} />
}
