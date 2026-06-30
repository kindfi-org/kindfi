import { getServerSession } from 'next-auth'
import { LayoutContainer } from '~/components/layout-container'
import { nextAuthOption } from '~/lib/auth/auth-options'

export async function SessionShell({ children }: { children: React.ReactNode }) {
	const session = await getServerSession(nextAuthOption)

	return <LayoutContainer session={session}>{children}</LayoutContainer>
}
