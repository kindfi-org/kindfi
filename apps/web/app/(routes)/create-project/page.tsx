import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { CreateProjectContentWizard } from '~/components/sections/projects/create/create-project-content-wizard'
import { UnauthorizedAccess } from '~/components/shared/unauthorized-access'
import { nextAuthOption } from '~/lib/auth/auth-options'

export default async function CreateProjectPage({
	searchParams,
}: {
	searchParams: Promise<{ foundationId?: string }>
}) {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user) {
		redirect('/sign-in?callbackUrl=/create-project')
	}

	const { foundationId } = await searchParams

	// Fetch user profile to check role
	const supabase = await createSupabaseServerClient()
	const { data: profileData, error } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', session.user.id)
		.single()

	if (error || !profileData) {
		logger.error('Error fetching user profile:', error)
		redirect('/sign-in')
	}

	const userRole = profileData.role

	// Only allow admin and creator roles
	if (userRole !== 'admin' && userRole !== 'creator') {
		return <UnauthorizedAccess userRole={userRole} />
	}

	let lockedFoundation: { id: string; name: string } | undefined
	if (foundationId) {
		const { data: foundation } = await supabase
			.from('foundations')
			.select('id, name')
			.eq('id', foundationId)
			.maybeSingle()

		if (foundation) {
			lockedFoundation = { id: foundation.id, name: foundation.name }
		}
	}

	return (
		<section className="container mx-auto px-4 py-8 md:py-12">
			<div className="text-center mb-8">
				<div className="inline-flex items-center px-4 py-2 rounded-full font-medium text-purple-600 bg-purple-100 border-transparent mb-4">
					Create Project
				</div>
				<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
					Let&apos;s get your KindFi project started
				</h1>
				<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
					Create a crowdfunding campaign and make an impact with the power of Web3 transparency.
				</p>
			</div>

			<CreateProjectContentWizard lockedFoundation={lockedFoundation} />
		</section>
	)
}
