import { db } from '@packages/drizzle'

export const getDb = async () => {
	return db
}
