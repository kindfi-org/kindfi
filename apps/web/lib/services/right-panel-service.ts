import {
	mockActivities,
	mockUpdates,
} from '~/lib/constants/mock-data/right-panel-mocks'
import type { Activity, Update } from '~/lib/types'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function getLatestUpdates(): Promise<Update[]> {
	await delay(1000)
	return mockUpdates
}

export async function getRecentActivities(): Promise<Activity[]> {
	await delay(1000)
	return mockActivities
}
