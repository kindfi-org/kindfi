import { createClient } from '@supabase/supabase-js'
import { appEnvConfig } from '../../config'

const appConfig = appEnvConfig()

export const supabase = createClient(
	appConfig.database.url,
	appConfig.database.serviceRoleKey,
)
