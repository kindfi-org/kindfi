import Link from 'next/link'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import {
	IoCreateOutline,
	IoMegaphoneOutline,
	IoStarOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoChevronForwardOutline,
} from 'react-icons/io5'

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
					Icon={IoCreateOutline}
				/>
				<SectionCard
					title="Pitch"
					description="Your story, problem statement, solution, and roadmap."
					href={`/projects/${slug}/manage/pitch`}
					cta="Improve pitch"
					Icon={IoMegaphoneOutline}
				/>
				<SectionCard
					title="Highlights"
					description="Key achievements, traction and notable metrics."
					href={`/projects/${slug}/manage/highlights`}
					cta="Add highlights"
					Icon={IoStarOutline}
				/>
				<SectionCard
					title="Members"
					description="Add and manage your team members."
					href={`/projects/${slug}/manage/members`}
					cta="Add team members"
					Icon={IoPeopleOutline}
				/>
				<SectionCard
					title="Escrow & Settings"
					description="Initialize and manage escrow, roles, and milestone approvals."
					href={`/projects/${slug}/manage/settings`}
					cta="Open settings"
					Icon={IoSettingsOutline}
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
	Icon,
}: {
	title: string
	description: string
	href: string
	cta: string
	Icon: React.ComponentType<{ size?: number; className?: string }>
}) {
	return (
		<Card className="transition-all hover:shadow-md hover:border-primary/30">
			<CardHeader>
				<div className="flex items-start gap-3">
					<div className="mt-1 rounded-md bg-primary/10 p-2 text-primary">
						<Icon size={18} />
					</div>
					<div className="min-w-0">
						<CardTitle className="text-xl">{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<Link replace href={href} className="inline-block">
					<Button variant="primary-gradient" endIcon={<IoChevronForwardOutline />}>{cta}</Button>
				</Link>
			</CardContent>
		</Card>
	)
}
