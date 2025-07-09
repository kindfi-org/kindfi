import { appEnvConfig } from '@packages/lib/config'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'

export async function uploadToBucket(file: File, bucket: string) {
	const supabase = createSupabaseBrowserClient()
	if (!bucket) {
		return { error: 'No storage bucket specified' }
	}

	const appConfig = appEnvConfig('web')
	const filePath = `${Date.now()}-${file.name}`
	const { error } = await supabase.storage
		.from(bucket)
		.upload(filePath, file, { cacheControl: '3600', upsert: false })

	if (error) {
		return { error: `Upload failed: ${error.message}` }
	}

	const publicUrl = `${appConfig.database.url}/storage/v1/object/public/${bucket}/${filePath}`
	return { url: publicUrl }
}
