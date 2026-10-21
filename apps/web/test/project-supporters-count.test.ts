import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { QueryClient, QueryObserver } from '@tanstack/react-query'

interface Contribution {
	contributor_id: string | null
}

interface ContributionsResponse {
	data: Contribution[] | null
	error: null
}

type QueryHandler = (projectId: string, signal: AbortSignal) => Promise<ContributionsResponse>

let queryHandler: QueryHandler
let observedAmountThreshold: number | undefined

class FakeContributionsQuery implements PromiseLike<ContributionsResponse> {
	private projectId = ''
	private signal = new AbortController().signal

	select() {
		return this
	}

	eq(_column: string, value: string) {
		this.projectId = value
		return this
	}

	gt(_column: string, amount: number) {
		observedAmountThreshold = amount
		return this
	}

	abortSignal(signal: AbortSignal) {
		this.signal = signal
		return this
	}

	then<TResult1 = ContributionsResponse, TResult2 = never>(
		onfulfilled?: ((value: ContributionsResponse) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): Promise<TResult1 | TResult2> {
		return queryHandler(this.projectId, this.signal).then(onfulfilled, onrejected)
	}
}

mock.module('@packages/lib/supabase-client', () => ({
	createSupabaseBrowserClient: () => ({
		from: () => new FakeContributionsQuery(),
	}),
}))

const { projectSupportersCountQueryOptions } = await import(
	'~/hooks/projects/use-project-supporters-count'
)

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	})
}

describe('useProjectSupportersCount query', () => {
	let queryClient: QueryClient

	beforeEach(() => {
		queryClient = createQueryClient()
		observedAmountThreshold = undefined
		queryHandler = async () => ({ data: [{ contributor_id: 'contributor-1' }], error: null })
	})

	afterEach(() => {
		queryClient.clear()
	})

	test('deduplicates requests shared by simultaneous consumers', async () => {
		let requestCount = 0
		let resolveRequest: ((response: ContributionsResponse) => void) | undefined
		let notifyRequestStarted: (() => void) | undefined
		const requestStarted = new Promise<void>((resolve) => {
			notifyRequestStarted = resolve
		})
		queryHandler = () => {
			requestCount += 1
			notifyRequestStarted?.()
			return new Promise((resolve) => {
				resolveRequest = resolve
			})
		}

		const options = projectSupportersCountQueryOptions('project-1')
		const firstConsumer = new QueryObserver(queryClient, options)
		const secondConsumer = new QueryObserver(queryClient, options)
		const unsubscribeFirst = firstConsumer.subscribe(() => {})
		const unsubscribeSecond = secondConsumer.subscribe(() => {})
		await requestStarted
		resolveRequest?.({
			data: [{ contributor_id: 'contributor-1' }, { contributor_id: 'contributor-1' }],
			error: null,
		})
		await queryClient.fetchQuery(options)

		expect(requestCount).toBe(1)
		expect(firstConsumer.getCurrentResult().data).toBe(1)
		expect(secondConsumer.getCurrentResult().data).toBe(1)
		unsubscribeFirst()
		unsubscribeSecond()
	})

	test('does not expose a slow result after switching to another project', async () => {
		let resolveOldRequest: ((response: ContributionsResponse) => void) | undefined
		let oldRequestSignal: AbortSignal | undefined
		let notifyOldRequestStarted: (() => void) | undefined
		let notifyNewRequestStarted: (() => void) | undefined
		const oldRequestStarted = new Promise<void>((resolve) => {
			notifyOldRequestStarted = resolve
		})
		const newRequestStarted = new Promise<void>((resolve) => {
			notifyNewRequestStarted = resolve
		})
		queryHandler = (projectId, signal) => {
			if (projectId === 'project-old') {
				oldRequestSignal = signal
				notifyOldRequestStarted?.()
				return new Promise((resolve) => {
					resolveOldRequest = resolve
				})
			}

			notifyNewRequestStarted?.()
			return Promise.resolve({
				data: [{ contributor_id: 'new-contributor' }],
				error: null,
			})
		}

		const observer = new QueryObserver(
			queryClient,
			projectSupportersCountQueryOptions('project-old'),
		)
		const unsubscribe = observer.subscribe(() => {})
		await oldRequestStarted
		observer.setOptions(projectSupportersCountQueryOptions('project-new'))
		expect(observer.getCurrentResult().data).toBeUndefined()
		await newRequestStarted
		await queryClient.fetchQuery(projectSupportersCountQueryOptions('project-new'))
		expect(observer.getCurrentResult().data).toBe(1)

		resolveOldRequest?.({
			data: [{ contributor_id: 'old-contributor-1' }, { contributor_id: 'old-contributor-2' }],
			error: null,
		})
		await new Promise((resolve) => setTimeout(resolve, 0))

		expect(oldRequestSignal?.aborted).toBe(true)
		expect(observer.getCurrentResult().data).toBe(1)
		unsubscribe()
	})

	test('supports explicit refetch and counts distinct positive contributors', async () => {
		let requestCount = 0
		queryHandler = async () => {
			requestCount += 1
			return {
				data:
					requestCount === 1
						? [
								{ contributor_id: 'contributor-1' },
								{ contributor_id: 'contributor-1' },
								{ contributor_id: null },
							]
						: [{ contributor_id: 'contributor-2' }, { contributor_id: 'contributor-3' }],
				error: null,
			}
		}

		const observer = new QueryObserver(queryClient, projectSupportersCountQueryOptions('project-1'))
		expect((await observer.refetch()).data).toBe(1)
		expect(observedAmountThreshold).toBe(0)
		expect((await observer.refetch()).data).toBe(2)
		expect(requestCount).toBe(2)
	})

	test('clears the previous count and disables fetching when the project ID is removed', async () => {
		let requestCount = 0
		queryHandler = async () => {
			requestCount += 1
			return { data: [{ contributor_id: 'contributor-1' }], error: null }
		}

		const observer = new QueryObserver(queryClient, projectSupportersCountQueryOptions('project-1'))
		const unsubscribe = observer.subscribe(() => {})
		await queryClient.fetchQuery(projectSupportersCountQueryOptions('project-1'))
		expect(observer.getCurrentResult().data).toBe(1)
		observer.setOptions(projectSupportersCountQueryOptions(undefined))

		expect(observer.options.enabled).toBe(false)
		expect(observer.options.refetchIntervalInBackground).toBe(false)
		expect(observer.options.refetchOnWindowFocus).toBe('always')
		expect(observer.getCurrentResult().isFetching).toBe(false)
		expect(observer.getCurrentResult().data).toBeUndefined()
		expect(requestCount).toBe(1)

		unsubscribe()
	})
})
