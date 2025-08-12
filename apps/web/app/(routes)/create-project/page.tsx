import { CreateProjectForm } from '~/components/sections/projects/create/create-project-form'
import { CreateProjectProvider } from '~/hooks/contexts/use-create-project.context'

export default function CreateProjectPage() {
	return (
		<CreateProjectProvider>
			<section className="container mx-auto px-4 py-8 md:py-12">
				<div className="text-center mb-8">
					<div className="inline-flex items-center px-4 py-2 rounded-full font-medium text-purple-600 bg-purple-100 border-transparent mb-4">
						Create Project
					</div>
					<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
						Let's get your KindFi project started
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Create a crowdfunding campaign and make an impact with the power of
						Web3 transparency.
					</p>
				</div>

				<CreateProjectForm />
			</section>
		</CreateProjectProvider>
	)
}
