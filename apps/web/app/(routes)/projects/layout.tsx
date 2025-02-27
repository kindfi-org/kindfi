import type { ReactNode } from 'react'

interface ProjectsLayoutProps {
	children: ReactNode
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
	return (
		<div className="min-h-screen bg-background">
			<main className="py-10">{children}</main>
		</div>
	)
}
