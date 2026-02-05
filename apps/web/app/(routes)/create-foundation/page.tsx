import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { CreateFoundationForm } from '~/components/sections/foundations/create/create-foundation-form'
import { UnauthorizedAccess } from '~/components/shared/unauthorized-access'
import { CreateFoundationProvider } from '~/hooks/contexts/use-create-foundation.context'
import { nextAuthOption } from '~/lib/auth/auth-options'

export default async function CreateFoundationPage() {
	const session = await getServerSession(nextAuthOption)

	if (!session?.user) {
		redirect('/sign-in?callbackUrl=/create-foundation')
	}

	// Fetch user profile to check role
	const supabase = await createSupabaseServerClient()
	const { data: profileData, error } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', session.user.id)
		.single()

	if (error || !profileData) {
		console.error('Error fetching user profile:', error)
		redirect('/sign-in')
	}

	const userRole = profileData.role

	// Only allow admin and creator roles
	if (userRole !== 'admin' && userRole !== 'creator') {
		return <UnauthorizedAccess userRole={userRole} />
	}

	return (
		<CreateFoundationProvider>
			<section className="container mx-auto px-4 py-8 md:py-12">
				<div className="text-center mb-8">
					<div className="inline-flex items-center px-4 py-2 rounded-full font-medium text-purple-600 bg-purple-100 border-transparent mb-4">
						Create Foundation
					</div>
					<h1 className="text-3xl md:text-4xl font-bold mb-4 py-2 sm:text-center gradient-text">
						Let&apos;s get your Foundation started
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Create a foundation profile to build trust and receive donations
						directly, or organize your campaigns under one umbrella.
					</p>
				</div>

				<CreateFoundationForm />
			</section>
		</CreateFoundationProvider>
	)
}
