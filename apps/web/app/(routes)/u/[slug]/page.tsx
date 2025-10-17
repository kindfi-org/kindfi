import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '~/components/base/button'

export default async function PublicProfilePage({
	params,
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const supabase = await createSupabaseServerClient()

	const { data: profile } = await supabase
		.from('profiles')
		.select('id, display_name, bio, image_url, role')
		.eq('slug', slug)
		.maybeSingle()

	if (!profile) notFound()

	return (
		<section className="container mx-auto px-4 py-8 space-y-6">
			<header className="flex items-center gap-4">
				{profile.image_url ? (
					<Image
						src={profile.image_url}
						alt={profile.display_name || slug}
						width={72}
						height={72}
						className="rounded-full object-cover"
					/>
				) : null}
				<div>
					<h1 className="text-2xl font-semibold">
						{profile.display_name || slug}
					</h1>
					<p className="text-muted-foreground">{profile.bio}</p>
				</div>
				<div className="ml-auto">
					{/* Client follow button wrapper */}
					<form action="#" className="inline-flex">
						<Button type="button" data-follow-user-id={profile.id}>
							Follow
						</Button>
					</form>
				</div>
			</header>
			{/* Future: activity feed, projects, followers, following */}
		</section>
	)
}
