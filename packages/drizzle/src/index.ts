import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './data/schema'

import { appEnvConfig } from '@packages/lib/config'

const appConfig = appEnvConfig()

const pool = new Pool({
	connectionString: appConfig.database.connectionString,
})

export const db = drizzle(pool, { schema })

export * from './data/schema'
export * from './data/relations'
