import { appEnvConfig } from '@packages/lib/config'
import type { AppEnvInterface } from '@packages/lib/types'
import type { Config } from 'drizzle-kit'

const appConfig: AppEnvInterface = appEnvConfig()

export default {
	// schema: './src/schema/*',
	schemaFilter: ['public', 'auth', 'next_auth'],
	out: './src/data',
	dialect: 'postgresql',
	dbCredentials: {
		url: appConfig.database.connectionString,
	},
	verbose: true,
	strict: true,
} satisfies Config
