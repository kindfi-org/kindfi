import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/base/card'
import { Button } from '~/components/base/button'

export default async function ProjectManagementDashboardPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	return (
		<div className="space-y-8">
			<header>
				<h1 className="text-3xl font-bold">Manage your project</h1>
				<p className="mt-1 text-muted-foreground">
					Update details, polish your pitch, manage escrow, and more.
				</p>
			</header>

			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<SectionCard
					title="Basics"
					description="Core details like name, category, location, and metadata."
					href={`/projects/${slug}/manage/basics`}
					cta="Edit basics"
				/>
				<SectionCard
					title="Pitch"
					description="Your story, problem statement, solution, and roadmap."
					href={`/projects/${slug}/manage/pitch`}
					cta="Improve pitch"
				/>
				<SectionCard
					title="Highlights"
					description="Key achievements, traction and notable metrics."
					href={`/projects/${slug}/manage/highlights`}
					cta="Add highlights"
				/>
					<SectionCard
					title="Team"
					description="Add and manage your team members."
					href={`/projects/${slug}/manage/team`}
					cta="Add team members"
				/>
				<SectionCard
					title="Escrow & Settings"
					description="Initialize and manage escrow, roles, and milestone approvals."
					href={`/projects/${slug}/manage/settings`}
					cta="Open settings"
				/>
			</div>
		</div>
	)
}

function SectionCard({
	title,
	description,
	href,
	cta,
}: {
	title: string
	description: string
	href: string
	cta: string
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<Link replace href={href} className="inline-block">
					<Button className="text-white">{cta}</Button>
				</Link>
			</CardContent>
		</Card>
	)
}
