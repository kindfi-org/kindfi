export type ProjectUpdate = {
	id: string
	project_id: string
	author_id: string
	content: string
	created_at: string
	updated_at: string
}

export function appendUpdatePage(
	previousUpdates: ProjectUpdate[],
	pageUpdates: ProjectUpdate[],
): ProjectUpdate[] {
	const updatesById = new Map(previousUpdates.map((update) => [update.id, update]))
	for (const update of pageUpdates) updatesById.set(update.id, update)
	return [...updatesById.values()]
}

export function mergeRealtimePage(
	previousUpdates: ProjectUpdate[],
	realtimePage: ProjectUpdate[],
): ProjectUpdate[] {
	const realtimeIds = new Set(realtimePage.map((update) => update.id))
	return [...realtimePage, ...previousUpdates.filter((update) => !realtimeIds.has(update.id))]
}
