import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getAllUsers(client: TypedSupabaseClient) {
	const { data, error } = await client
		.from('profiles')
		.select(
			`
      id,
      role,
      display_name,
      email,
      image_url,
      created_at,
      updated_at,
      slug
    `,
		)
		.order('created_at', { ascending: false })

	if (error) throw error

	return (
		data?.map((user) => ({
			id: user.id,
			role: user.role,
			displayName: user.display_name,
			email: user.email,
			imageUrl: user.image_url,
			createdAt: user.created_at,
			updatedAt: user.updated_at,
			slug: user.slug,
		})) ?? []
	)
}
