'use client'

import { motion } from 'framer-motion'
import { Home, Layers } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '~/components/base/breadcrumb'

interface BreadcrumbContainerProps {
	title?: string
	category?: {
		name: string
		slug: string
	}
	manageSection?: string
	subSection?: string
}

export function BreadcrumbContainer({
	title,
	category,
	manageSection,
	subSection,
}: BreadcrumbContainerProps) {
	const pathname = usePathname()
	const params = useParams()
	const projectSlug = params?.slug as string | undefined

	// Only show breadcrumbs on /projects pages
	if (!pathname.includes('/projects')) {
		return null
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="mb-4"
		>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/" className="flex items-center" legacyBehavior>
								<Home className="h-4 w-4" />
								<span className="sr-only">Home</span>
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>

					<BreadcrumbSeparator />

					<BreadcrumbItem>
						{pathname === '/projects' ? (
							<BreadcrumbPage className="flex items-center">
								<Layers className="h-4 w-4 mr-1" />
								<span>Projects</span>
							</BreadcrumbPage>
						) : (
							<BreadcrumbLink asChild>
								<Link
									href="/projects"
									className="flex items-center"
									legacyBehavior
								>
									<span>Projects</span>
								</Link>
							</BreadcrumbLink>
						)}
					</BreadcrumbItem>

					{category && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link
										href={`/projects?category=${encodeURIComponent(category.slug)}`}
										legacyBehavior
									>
										{category.name}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}

					{title && projectSlug && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={`/projects/${projectSlug}`} legacyBehavior>
										{title}
									</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
						</>
					)}

					{manageSection && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{subSection && projectSlug ? (
									<BreadcrumbLink asChild>
										<Link
											href={`/projects/${projectSlug}/manage`}
											legacyBehavior
										>
											{manageSection}
										</Link>
									</BreadcrumbLink>
								) : (
									<BreadcrumbPage>{manageSection}</BreadcrumbPage>
								)}
							</BreadcrumbItem>
						</>
					)}

					{subSection && (
						<>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage className="truncate max-w-[200px] md:max-w-[300px] lg:max-w-none">
									{subSection}
								</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					)}
				</BreadcrumbList>
			</Breadcrumb>
		</motion.div>
	)
}
