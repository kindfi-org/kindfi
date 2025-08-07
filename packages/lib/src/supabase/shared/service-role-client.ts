import { createClient } from '@supabase/supabase-js'
import { appEnvConfig } from '../../config'
import type { AppEnvInterface } from '../../types'

const appConfig: AppEnvInterface = appEnvConfig()

export const supabase = createClient(
	appConfig.database.url,
	appConfig.database.serviceRoleKey,
)
