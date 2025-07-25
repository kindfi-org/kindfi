import { appEnvConfig } from '@packages/lib/config'
import type { Config } from 'drizzle-kit'
import type { AppEnvInterface } from '~/packages/lib/src/types'

const appConfig: AppEnvInterface = appEnvConfig()

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
