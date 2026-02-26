'use client'

import {
	IoConstructOutline,
	IoFlagOutline,
	IoGlobeOutline,
	IoHeartCircleOutline,
	IoMailOutline,
	IoNotificationsOutline,
	IoSettingsOutline,
	IoShieldCheckmarkOutline,
} from 'react-icons/io5'
import { Badge } from '~/components/base/badge'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'

const upcomingFeatures = [
	{ label: 'Platform configuration', Icon: IoSettingsOutline },
	{ label: 'Email templates', Icon: IoMailOutline },
	{ label: 'Notification settings', Icon: IoNotificationsOutline },
	{ label: 'Feature flags', Icon: IoFlagOutline },
	{ label: 'Maintenance mode', Icon: IoConstructOutline },
	{ label: 'System health monitoring', Icon: IoHeartCircleOutline },
] as const

export function AdminSettings() {
	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Settings"
				description="Platform-wide settings and configurations"
			/>

			{/* General */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<IoGlobeOutline
							className="h-5 w-5 text-muted-foreground"
							aria-hidden
						/>
						General
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Basic platform identity and contact
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Platform name
							</p>
							<p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
								Kindfi
							</p>
						</div>
						<div className="space-y-2">
							<p className="text-sm font-medium text-muted-foreground">
								Support email
							</p>
							<p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
								Configure in environment
							</p>
						</div>
					</div>
					<p className="text-xs text-muted-foreground">
						Editable general settings will be available in a future update.
					</p>
				</CardContent>
			</Card>

			{/* Notifications & email */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<IoMailOutline
							className="h-5 w-5 text-muted-foreground"
							aria-hidden
						/>
						Notifications & email
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Email templates and notification preferences
					</p>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm text-muted-foreground">
						<li>• Welcome and verification emails</li>
						<li>• Project and foundation notifications</li>
						<li>• Admin alert rules</li>
					</ul>
					<Badge variant="secondary" className="mt-4">
						Coming soon
					</Badge>
				</CardContent>
			</Card>

			{/* Safety & operations */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<IoShieldCheckmarkOutline
							className="h-5 w-5 text-muted-foreground"
							aria-hidden
						/>
						Safety & operations
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Feature flags, maintenance mode, and system health
					</p>
				</CardHeader>
				<CardContent>
					<ul className="space-y-2 text-sm text-muted-foreground">
						<li>• Feature flags for gradual rollouts</li>
						<li>• Maintenance mode and status page</li>
						<li>• System health and dependency checks</li>
					</ul>
					<Badge variant="secondary" className="mt-4">
						Coming soon
					</Badge>
				</CardContent>
			</Card>

			{/* Planned features grid */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<IoFlagOutline
							className="h-5 w-5 text-muted-foreground"
							aria-hidden
						/>
						Planned settings
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Additional controls planned for the settings dashboard
					</p>
				</CardHeader>
				<CardContent>
					<ul className="grid gap-3 sm:grid-cols-2">
						{upcomingFeatures.map(({ label, Icon }) => (
							<li
								key={label}
								className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3"
							>
								<span
									className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted"
									aria-hidden
								>
									<Icon className="h-4 w-4 text-muted-foreground" />
								</span>
								<span className="text-sm font-medium">{label}</span>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>

			{/* System health placeholder */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-lg">
						<IoHeartCircleOutline
							className="h-5 w-5 text-muted-foreground"
							aria-hidden
						/>
						System health
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Database, storage, and external services
					</p>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Health checks and status will appear here in a future update.
					</p>
				</CardContent>
			</Card>
		</div>
	)
}
