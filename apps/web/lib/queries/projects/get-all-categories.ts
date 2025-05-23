import type { TypedSupabaseClient } from '@packages/lib/types'

export async function getAllCategories(client: TypedSupabaseClient) {
	const { data, error } = await client
		.from('categories')
		.select('*')
		.order('name', { ascending: true })

	if (error) throw error

	return data
}
