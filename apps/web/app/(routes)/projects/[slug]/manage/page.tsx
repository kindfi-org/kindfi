import Link from 'next/link'
import {
	IoChevronForwardOutline,
	IoCreateOutline,
	IoLockClosedOutline,
	IoMegaphoneOutline,
	IoPeopleOutline,
	IoSettingsOutline,
	IoStarOutline,
} from 'react-icons/io5'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { Badge } from '~/components/base/badge'

interface Section {
	title: string
	description: string
	href: string
	cta: string
	Icon: React.ComponentType<{ size?: number; className?: string }>
	category: 'content' | 'team' | 'escrow'
}

const sections: Section[] = [
	{
		title: 'Basics',
		description: 'Core details like name, category, location, and metadata.',
		href: 'basics',
		cta: 'Edit basics',
		Icon: IoCreateOutline,
		category: 'content',
	},
	{
		title: 'Pitch',
		description: 'Your story, problem statement, solution, and roadmap.',
		href: 'pitch',
		cta: 'Improve pitch',
		Icon: IoMegaphoneOutline,
		category: 'content',
	},
	{
		title: 'Highlights',
		description: 'Key achievements, traction and notable metrics.',
		href: 'highlights',
		cta: 'Add highlights',
		Icon: IoStarOutline,
		category: 'content',
	},
	{
		title: 'Members',
		description: 'Add and manage your team members.',
		href: 'members',
		cta: 'Manage team',
		Icon: IoPeopleOutline,
		category: 'team',
	},
	{
		title: 'Escrow Creation',
		description: 'Initialize and configure your escrow contract, roles, and milestones.',
		href: 'settings',
		cta: 'Create escrow',
		Icon: IoSettingsOutline,
		category: 'escrow',
	},
	{
		title: 'Escrow Management',
		description: 'Fund escrow, approve milestones, release funds, and track balance.',
		href: 'settings/manage',
		cta: 'Manage escrow',
		Icon: IoLockClosedOutline,
		category: 'escrow',
	},
]

const categoryConfig = {
	content: {
		label: 'Content',
		color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
		gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
	},
	team: {
		label: 'Team',
		color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
		gradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
	},
	escrow: {
		label: 'Escrow',
		color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900',
		gradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
	},
}

export default async function ProjectManagementDashboardPage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params

	const contentSections = sections.filter((s) => s.category === 'content')
	const teamSections = sections.filter((s) => s.category === 'team')
	const escrowSections = sections.filter((s) => s.category === 'escrow')

	return (
		<div className="space-y-10">
			<header className="space-y-3">
				<div className="flex items-center gap-3">
					<div className="h-1 w-12 rounded-full bg-gradient-to-r from-primary to-primary/50" />
					<h1 className="text-4xl font-bold tracking-tight">Project Management</h1>
				</div>
				<p className="text-lg text-muted-foreground max-w-2xl">
					Manage your project content, team, and escrow settings. Keep everything
					up to date and running smoothly.
				</p>
			</header>

			{/* Content Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<Badge
						variant="outline"
						className={categoryConfig.content.color}
					>
						{categoryConfig.content.label}
					</Badge>
					<div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{contentSections.map((section) => (
						<SectionCard
							key={section.title}
							{...section}
							slug={slug}
							categoryConfig={categoryConfig.content}
						/>
					))}
				</div>
			</div>

			{/* Team Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<Badge
						variant="outline"
						className={categoryConfig.team.color}
					>
						{categoryConfig.team.label}
					</Badge>
					<div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{teamSections.map((section) => (
						<SectionCard
							key={section.title}
							{...section}
							slug={slug}
							categoryConfig={categoryConfig.team}
						/>
					))}
				</div>
			</div>

			{/* Escrow Section */}
			<div className="space-y-4">
				<div className="flex items-center gap-3">
					<Badge
						variant="outline"
						className={categoryConfig.escrow.color}
					>
						{categoryConfig.escrow.label}
					</Badge>
					<div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{escrowSections.map((section) => (
						<SectionCard
							key={section.title}
							{...section}
							slug={slug}
							categoryConfig={categoryConfig.escrow}
						/>
					))}
				</div>
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
	slug,
	categoryConfig,
}: Section & {
	slug: string
	categoryConfig: { gradient: string }
}) {
	return (
		<Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-2 hover:border-primary/20">
			<div
				className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>
			<CardHeader className="relative z-10">
				<div className="flex items-start gap-4">
					<div className="mt-1 rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
						<Icon size={20} />
					</div>
					<div className="min-w-0 flex-1 space-y-1">
						<CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
							{title}
						</CardTitle>
						<CardDescription className="text-sm leading-relaxed">
							{description}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="relative z-10 pt-0">
				<Link href={`/projects/${slug}/manage/${href}`} className="inline-block">
					<Button
						variant="outline"
						className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
						endIcon={<IoChevronForwardOutline className="group-hover:translate-x-1 transition-transform" />}
					>
						{cta}
					</Button>
				</Link>
			</CardContent>
		</Card>
	)
}
