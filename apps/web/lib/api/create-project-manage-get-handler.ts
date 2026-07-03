import type { TypedSupabaseClient } from '@packages/lib/types'
import { NextResponse } from 'next/server'
import { requireProjectManageBySlug } from '~/lib/api/require-project-manage-by-slug'

type ManageGetHandler<TData> = (
	client: TypedSupabaseClient,
	slug: string,
	projectId: string,
) => Promise<TData | null>

export function createProjectManageGetHandler<TData>(handler: ManageGetHandler<TData>) {
	return async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
		const { slug } = await context.params
		const auth = await requireProjectManageBySlug(slug)

		if ('response' in auth) {
			return auth.response
		}

		try {
			const data = await handler(auth.client, auth.slug, auth.projectId)
			if (data === null) {
				return NextResponse.json({ error: 'Not found' }, { status: 404 })
			}

			return NextResponse.json(data)
		} catch {
			return NextResponse.json({ error: 'Failed to load project data' }, { status: 500 })
		}
	}
}
