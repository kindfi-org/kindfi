import { ChevronRight } from 'lucide-react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '~/components/base/breadcrumb'

interface LessonPageParams {
	params: {
		moduleId: string
		lessonId: string
	}
}

export default async function LessonPage({ params }: LessonPageParams) {
	const { moduleId } = await params

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="mb-6">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink href="/learn">Learn</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator>
							<ChevronRight className="h-4 w-4" />
						</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbLink href={`/learn/${moduleId}`}>
								Stellar Blockchain Basics
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator>
							<ChevronRight className="h-4 w-4" />
						</BreadcrumbSeparator>
						<BreadcrumbItem>
							<BreadcrumbLink className="font-semibold text-foreground">
								Consensus Mechanism
							</BreadcrumbLink>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</div>
	)
}
