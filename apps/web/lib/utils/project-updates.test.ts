import { describe, expect, test } from 'bun:test'
import { appendUpdatePage, mergeRealtimePage, type ProjectUpdate } from './project-updates'

const update = (id: string, content = id): ProjectUpdate => ({
	id,
	project_id: 'project-1',
	author_id: 'author-1',
	content,
	created_at: id,
	updated_at: id,
})

describe('project update list merging', () => {
	test('appends an explicit subsequent page without duplicate IDs', () => {
		expect(appendUpdatePage([update('one'), update('two')], [update('two', 'edited'), update('three')])).toEqual([
			update('one'),
			update('two', 'edited'),
			update('three'),
		])
	})

	test('replaces the realtime page while preserving loaded pages', () => {
		const pageOne = [update('one'), update('two')]
		const pageTwo = [update('three'), update('four')]
		const refreshedPageTwo = [update('three', 'edited'), update('five')]

		expect(mergeRealtimePage([...pageOne, ...pageTwo], refreshedPageTwo)).toEqual([
			...refreshedPageTwo,
			...pageOne,
			update('four'),
		])
	})
})
