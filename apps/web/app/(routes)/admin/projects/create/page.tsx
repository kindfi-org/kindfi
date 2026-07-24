import { Badge } from '~/components/base/badge'
import { AdminSectionHeader } from '~/components/sections/admin/admin-section-header'
import { CreateProjectContentWizard } from '~/components/sections/projects/create/create-project-content-wizard'

export default function AdminCreateDevelopmentProjectPage() {
	return (
		<div className="space-y-8">
			<AdminSectionHeader
				title="Create development project"
				description="Internal-only project for testing and development. Never visible to regular users."
			>
				<Badge variant="secondary" className="bg-amber-100 text-amber-900 hover:bg-amber-100">
					Development only
				</Badge>
			</AdminSectionHeader>

			<section className="mx-auto max-w-3xl">
				<CreateProjectContentWizard developmentOnly />
			</section>
		</div>
	)
}
