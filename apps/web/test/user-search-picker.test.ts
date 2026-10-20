import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { Window } from 'happy-dom'
import React, { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { SearchableUser } from '~/lib/schemas/user.schemas'

const happyWindow = new Window()
Object.assign(globalThis, {
	document: happyWindow.document,
	HTMLElement: happyWindow.HTMLElement,
	Event: happyWindow.Event,
	InputEvent: happyWindow.InputEvent,
	MouseEvent: happyWindow.MouseEvent,
	Node: happyWindow.Node,
	window: happyWindow,
})
;(
	globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

type Deferred<T> = {
	promise: Promise<T>
	resolve: (value: T) => void
	reject: (reason?: unknown) => void
}

type RequestRecord = {
	query: string
	deferred: Deferred<Response>
}

const popoverContext = React.createContext<{
	open: boolean
	onOpenChange: (open: boolean) => void
} | null>(null)
let commandInputOnValueChange: ((value: string) => void) | undefined

mock.module('~/components/base/avatar', () => ({
	Avatar: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', { 'data-avatar': true }, children),
	AvatarFallback: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', null, children),
	AvatarImage: ({ alt }: { alt?: string }) => React.createElement('img', { alt: alt ?? '' }),
}))

mock.module('~/components/base/command', () => ({
	Command: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', null, children),
	CommandEmpty: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', null, children),
	CommandGroup: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', null, children),
	CommandInput: ({
		onValueChange,
		value,
		...props
	}: {
		onValueChange?: (value: string) => void
		value: string
	}) => {
		commandInputOnValueChange = onValueChange
		return React.createElement('input', { ...props, value, onChange: () => undefined })
	},
	CommandItem: ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) =>
		React.createElement(
			'button',
			{
				type: 'button',
				onClick: () => onSelect?.(),
			},
			children,
		),
	CommandList: ({ children }: { children: React.ReactNode }) =>
		React.createElement('div', null, children),
}))

mock.module('~/components/base/popover', () => ({
	Popover: ({
		children,
		open,
		onOpenChange,
	}: {
		children: React.ReactNode
		open: boolean
		onOpenChange: (open: boolean) => void
	}) => React.createElement(popoverContext.Provider, { value: { open, onOpenChange } }, children),
	PopoverContent: ({ children }: { children: React.ReactNode }) => {
		const context = React.useContext(popoverContext)
		return context?.open ? React.createElement('div', null, children) : null
	},
	PopoverTrigger: ({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) => {
		const context = React.useContext(popoverContext)

		if (asChild) {
			const trigger = children as React.ReactElement<{
				onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
			}>
			return React.cloneElement(trigger, {
				onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
					trigger.props.onClick?.(event)
					context?.onOpenChange(!context.open)
				},
			})
		}

		return React.createElement('button', { type: 'button' }, children)
	},
}))

mock.module('~/lib/utils', () => ({
	cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' '),
	getAvatarFallback: (value: string) => value.slice(0, 1).toUpperCase(),
}))

const { UserSearchPicker } = await import('~/components/shared/user-search-picker')

const fetchMock = mock(async (input: RequestInfo | URL) => {
	const url =
		typeof input === 'string' ? new URL(input, 'http://localhost') : new URL(input.toString())
	const query = url.searchParams.get('q') ?? ''
	const deferred = createDeferred<Response>()
	requests.push({ query, deferred })
	return deferred.promise
})

const requests: RequestRecord[] = []
const originalFetch = globalThis.fetch

function createDeferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void
	let reject!: (reason?: unknown) => void
	const promise = new Promise<T>((promiseResolve, promiseReject) => {
		resolve = promiseResolve
		reject = promiseReject
	})

	return { promise, resolve, reject }
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' },
	})
}

function renderPicker(onSelect: (user: SearchableUser | null) => void = () => undefined): {
	container: HTMLDivElement
	root: Root
} {
	const container = document.createElement('div')
	document.body.appendChild(container)
	const root = createRoot(container)

	act(() => {
		root.render(
			React.createElement(UserSearchPicker, {
				selectedUser: null,
				onSelect,
			}),
		)
	})

	return { container, root }
}

async function openPicker(container: HTMLDivElement): Promise<void> {
	const trigger = container.querySelector('button')
	expect(trigger).not.toBeNull()

	await act(async () => {
		trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
	})
}

async function typeQuery(container: HTMLDivElement, value: string): Promise<void> {
	expect(container.querySelector('input')).not.toBeNull()
	expect(commandInputOnValueChange).toBeDefined()

	await act(async () => {
		commandInputOnValueChange?.(value)
	})
}

async function wait(ms: number): Promise<void> {
	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, ms))
	})
}

async function flush(): Promise<void> {
	await act(async () => {
		await Promise.resolve()
	})
}

function findRequest(query: string): RequestRecord {
	const request = requests.find((entry) => entry.query === query)
	expect(request).toBeDefined()
	return request as RequestRecord
}

beforeEach(() => {
	requests.length = 0
	fetchMock.mockClear()
	globalThis.fetch = fetchMock as unknown as typeof fetch
})

afterEach(() => {
	globalThis.fetch = originalFetch
})

describe('UserSearchPicker', () => {
	test('hides stale results immediately when the query changes', async () => {
		const onSelect = mock(() => undefined)
		const { container, root } = renderPicker(onSelect)

		try {
			await openPicker(container)
			await typeQuery(container, 'Alice')
			await wait(320)

			expect(fetchMock.mock.calls).toHaveLength(1)
			findRequest('Alice').deferred.resolve(
				jsonResponse({
					users: [
						{
							id: 'alice-1',
							slug: 'alice',
							displayName: 'Alice',
							email: 'alice@example.com',
							imageUrl: null,
						},
					] satisfies SearchableUser[],
				}),
			)
			await flush()

			expect(container.textContent).toContain('Alice')
			const aliceItem = [...container.querySelectorAll('button')].find((button) =>
				button.textContent?.includes('Alice'),
			)
			expect(aliceItem).toBeDefined()

			await typeQuery(container, 'Bob')

			expect(container.textContent).not.toContain('Alice')
			expect(container.textContent).toContain('Searching…')
			expect(aliceItem?.isConnected).toBe(false)
			expect(onSelect).not.toHaveBeenCalled()
		} finally {
			act(() => {
				root.unmount()
			})
			container.remove()
		}
	})

	test('ignores out-of-order responses from stale requests', async () => {
		const { container, root } = renderPicker()

		try {
			await openPicker(container)
			await typeQuery(container, 'Alice')
			await wait(320)
			await typeQuery(container, 'Bob')
			await wait(320)

			expect(fetchMock.mock.calls).toHaveLength(2)

			findRequest('Alice').deferred.resolve(
				jsonResponse({
					users: [
						{
							id: 'alice-1',
							slug: 'alice',
							displayName: 'Alice',
							email: 'alice@example.com',
							imageUrl: null,
						},
					] satisfies SearchableUser[],
				}),
			)
			await flush()

			expect(container.textContent).not.toContain('Alice')
			expect(container.textContent).toContain('Searching…')

			findRequest('Bob').deferred.resolve(
				jsonResponse({
					users: [
						{
							id: 'bob-1',
							slug: 'bob',
							displayName: 'Bob',
							email: 'bob@example.com',
							imageUrl: null,
						},
					] satisfies SearchableUser[],
				}),
			)
			await flush()

			expect(container.textContent).toContain('Bob')
			expect(container.textContent).not.toContain('Alice')
		} finally {
			act(() => {
				root.unmount()
			})
			container.remove()
		}
	})

	test('clears results and errors when the query becomes too short', async () => {
		const { container, root } = renderPicker()

		try {
			await openPicker(container)
			await typeQuery(container, 'Alice')
			await wait(320)
			findRequest('Alice').deferred.resolve(
				jsonResponse({
					users: [
						{
							id: 'alice-1',
							slug: 'alice',
							displayName: 'Alice',
							email: 'alice@example.com',
							imageUrl: null,
						},
					] satisfies SearchableUser[],
				}),
			)
			await flush()

			expect(container.textContent).toContain('Alice')

			await typeQuery(container, 'A')

			expect(container.textContent).not.toContain('Alice')
			expect(container.textContent).toContain('Type at least 2 characters to search.')
			expect(container.textContent).not.toContain('Searching…')

			await typeQuery(container, '')

			expect(container.textContent).not.toContain('Alice')
			expect(container.textContent).toContain('Type at least 2 characters to search.')
		} finally {
			act(() => {
				root.unmount()
			})
			container.remove()
		}
	})

	test('keeps the current search loading after an aborted stale request', async () => {
		const { container, root } = renderPicker()

		try {
			await openPicker(container)
			await typeQuery(container, 'Alice')
			await wait(320)
			await typeQuery(container, 'Bob')
			await wait(320)

			findRequest('Alice').deferred.reject(new DOMException('Aborted', 'AbortError'))
			await flush()

			expect(container.textContent).toContain('Searching…')
			expect(container.textContent).not.toContain('Failed to search users')

			findRequest('Bob').deferred.resolve(jsonResponse({ users: [] }))
			await flush()

			expect(container.textContent).not.toContain('Searching…')
			expect(container.textContent).toContain('No users found.')
		} finally {
			act(() => {
				root.unmount()
			})
			container.remove()
		}
	})

	test('clears an HTTP search error when the query becomes too short', async () => {
		const { container, root } = renderPicker()

		try {
			await openPicker(container)
			await typeQuery(container, 'Alice')
			await wait(320)
			findRequest('Alice').deferred.resolve(jsonResponse({ error: 'boom' }, 500))
			await flush()

			expect(container.textContent).toContain('boom')

			await typeQuery(container, 'A')

			expect(container.textContent).not.toContain('boom')
			expect(container.textContent).toContain('Type at least 2 characters to search.')
		} finally {
			act(() => {
				root.unmount()
			})
			container.remove()
		}
	})
})
