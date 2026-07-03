import { type QueryKey, type UseQueryOptions, useQuery } from '@tanstack/react-query'

interface UseManagedProjectQueryOptions<TData>
	extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> {
	additionalKeyValues?: unknown[]
}

export function useManagedProjectQuery<TData>(
	queryName: string,
	projectSlug: string,
	dataPath: string,
	options?: UseManagedProjectQueryOptions<TData>,
) {
	const baseKey = ['supabase', queryName]
	const queryKey = options?.additionalKeyValues?.length
		? [...baseKey, ...options.additionalKeyValues]
		: [...baseKey, projectSlug]

	return useQuery<TData, Error>({
		queryKey,
		queryFn: async () => {
			const response = await fetch(`/api/projects/${projectSlug}/manage/${dataPath}`)
			if (response.status === 404) {
				throw new Error('Not found')
			}
			if (!response.ok) {
				throw new Error('Failed to load project data')
			}
			return response.json() as Promise<TData>
		},
		...options,
	})
}
