import type { Message } from '~/components/form-message'
import { ResetAccountComponent } from '~/components/pages/auth/reset-account'

export default async function ResetAccount(props: {
	searchParams: Promise<Message>
}) {
	const searchParams = await props.searchParams

	return <ResetAccountComponent searchParams={searchParams} />
}
