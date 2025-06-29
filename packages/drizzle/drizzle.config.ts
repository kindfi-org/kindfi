import { appEnvConfig } from '@packages/lib/config'
import type { Config } from 'drizzle-kit'

const appConfig = appEnvConfig()

export default {
	// schema: './src/schema/*',
	schemaFilter: ['public', 'auth'],
	out: './src/data',
	dialect: 'postgresql',
	dbCredentials: {
		url: appConfig.database.connectionString,
	},
	verbose: true,
	strict: true,
} satisfies Config
