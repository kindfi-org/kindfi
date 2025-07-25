import { createClient } from '@supabase/supabase-js'
import type { AppEnvInterface } from '~/packages/lib/src/types'
import { appEnvConfig } from '../../config'

const appConfig: AppEnvInterface = appEnvConfig()

export const supabase = createClient(
	appConfig.database.url,
	appConfig.database.serviceRoleKey,
)
