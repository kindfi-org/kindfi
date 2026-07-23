import { redirect } from 'next/navigation'

export default async function FoundationEscrowManagePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	redirect(`/foundations/${slug}/manage`)
}
